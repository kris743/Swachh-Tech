"""
SWACHH TECH AI — Route Optimizer Model
Uses Google OR-Tools to solve the Capacitated Vehicle Routing Problem (CVRP)
for waste-collection fleet optimization.
"""

from __future__ import annotations

import logging
import math
from typing import Any, Dict, List, Optional, Tuple

from app.utils.helpers import build_distance_matrix, haversine_km

logger = logging.getLogger("swachh.optimizer")


class RouteOptimizer:
    """Capacitated VRP solver backed by OR-Tools.

    Lifecycle
    ---------
    Stateless — no training needed.  ``optimize()`` is called per request.
    """

    def __init__(self) -> None:
        self._is_ready = False
        try:
            from ortools.constraint_solver import pywrapcp, routing_enums_pb2

            self._pywrapcp = pywrapcp
            self._routing_enums = routing_enums_pb2
            self._is_ready = True
            logger.info("OR-Tools loaded successfully.")
        except ImportError as exc:
            logger.warning("OR-Tools not available (%s). Route optimizer disabled.", exc)

    # ── Public API ──────────────────────────────────────────

    def optimize(
        self,
        depot: Tuple[float, float],
        pickups: List[Dict[str, Any]],
        num_vehicles: int,
        vehicle_capacity: float,
        max_distance_km: float = 100.0,
    ) -> Dict[str, Any]:
        """Solve the CVRP and return optimized routes.

        Parameters
        ----------
        depot : (lat, lon) of the depot / starting location.
        pickups : list of dicts with keys: id, latitude, longitude, demand.
        num_vehicles : number of vehicles in the fleet.
        vehicle_capacity : max load per vehicle in kg.
        max_distance_km : maximum distance per vehicle route in km.
        """
        if not self._is_ready:
            raise RuntimeError("OR-Tools is not installed.")

        # Build locations list: index 0 = depot, 1..N = pickup points
        locations: List[Tuple[float, float]] = [depot]
        demands: List[int] = [0]  # depot has zero demand
        pickup_ids: List[str] = ["depot"]

        for p in pickups:
            locations.append((p["latitude"], p["longitude"]))
            demands.append(int(math.ceil(p["demand"])))
            pickup_ids.append(p["id"])

        n = len(locations)
        distance_matrix = build_distance_matrix(locations)

        # ── OR-Tools model ──────────────────────────────────
        manager = self._pywrapcp.RoutingIndexManager(n, num_vehicles, 0)
        routing = self._pywrapcp.RoutingModel(manager)

        # Distance callback
        def distance_callback(from_index: int, to_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]

        transit_cb_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_cb_index)

        # Distance dimension (max distance constraint)
        max_distance_m = int(max_distance_km * 1000)
        routing.AddDimension(
            transit_cb_index,
            0,               # no slack
            max_distance_m,  # max distance per vehicle
            True,            # start cumul to zero
            "Distance",
        )
        distance_dimension = routing.GetDimensionOrDie("Distance")
        distance_dimension.SetGlobalSpanCostCoefficient(100)

        # Capacity constraint
        def demand_callback(from_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            return demands[from_node]

        demand_cb_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_cb_index,
            0,                                              # no slack
            [int(vehicle_capacity)] * num_vehicles,         # capacities
            True,                                           # start cumul to zero
            "Capacity",
        )

        # Search parameters
        search_params = self._pywrapcp.DefaultRoutingSearchParameters()
        search_params.first_solution_strategy = (
            self._routing_enums.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_params.local_search_metaheuristic = (
            self._routing_enums.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_params.time_limit.FromSeconds(5)

        # Solve
        solution = routing.SolveWithParameters(search_params)

        if solution is None:
            # Fallback: return a naive single-vehicle route
            logger.warning("OR-Tools could not find a feasible solution; returning naive route.")
            return self._naive_route(depot, pickups, locations, pickup_ids, demands)

        # ── Extract solution ────────────────────────────────
        return self._extract_solution(
            manager, routing, solution, locations, pickup_ids, demands,
            num_vehicles, vehicle_capacity, distance_matrix,
        )

    # ── Solution extraction ─────────────────────────────────

    def _extract_solution(
        self,
        manager: Any,
        routing: Any,
        solution: Any,
        locations: List[Tuple[float, float]],
        pickup_ids: List[str],
        demands: List[int],
        num_vehicles: int,
        vehicle_capacity: float,
        distance_matrix: List[List[int]],
    ) -> Dict[str, Any]:
        """Parse the OR-Tools solution into the API response format."""
        optimized_routes: List[Dict[str, Any]] = []
        total_distance_m = 0
        total_load = 0

        for vehicle_id in range(num_vehicles):
            index = routing.Start(vehicle_id)
            stops: List[Dict[str, Any]] = []
            route_distance_m = 0
            route_load = 0
            order = 0

            while not routing.IsEnd(index):
                node = manager.IndexToNode(index)
                next_index = solution.Value(routing.NextVar(index))
                next_node = manager.IndexToNode(next_index)
                route_distance_m += distance_matrix[node][next_node]

                if node != 0:  # skip depot
                    order += 1
                    route_load += demands[node]
                    stops.append(
                        {
                            "id": pickup_ids[node],
                            "order": order,
                            "latitude": locations[node][0],
                            "longitude": locations[node][1],
                            "demand_kg": float(demands[node]),
                            "arrival_distance_km": round(route_distance_m / 1000, 2),
                        }
                    )
                index = next_index

            if stops:
                dist_km = round(route_distance_m / 1000, 2)
                est_time = round(dist_km / 25 * 60, 1)  # ~25 km/h average speed
                cap_util = round(route_load / vehicle_capacity * 100, 1) if vehicle_capacity else 0.0
                optimized_routes.append(
                    {
                        "vehicle_id": vehicle_id,
                        "stops": stops,
                        "total_distance_km": dist_km,
                        "total_load_kg": float(route_load),
                        "estimated_time_minutes": est_time,
                        "capacity_utilization_percent": cap_util,
                    }
                )
                total_distance_m += route_distance_m
                total_load += route_load

        total_km = round(total_distance_m / 1000, 2)
        total_time = round(total_km / 25 * 60, 1)

        # Naive distance for savings calculation
        naive_km = self._calc_naive_distance(locations)
        savings = round((1 - total_km / max(naive_km, 0.01)) * 100, 1) if naive_km > 0 else 0.0
        savings = max(savings, 0.0)

        return {
            "optimized_routes": optimized_routes,
            "total_distance_km": total_km,
            "total_time_minutes": total_time,
            "total_load_kg": float(total_load),
            "vehicles_used": len(optimized_routes),
            "savings_vs_naive_percent": savings,
        }

    # ── Naive baseline ──────────────────────────────────────

    def _calc_naive_distance(
        self, locations: List[Tuple[float, float]]
    ) -> float:
        """Calculate total distance if each pickup were served individually
        from the depot (star topology)."""
        depot = locations[0]
        total = 0.0
        for loc in locations[1:]:
            total += 2 * haversine_km(*depot, *loc)  # round trip
        return total

    def _naive_route(
        self,
        depot: Tuple[float, float],
        pickups: List[Dict[str, Any]],
        locations: List[Tuple[float, float]],
        pickup_ids: List[str],
        demands: List[int],
    ) -> Dict[str, Any]:
        """Build a naive single-vehicle route visiting all pickups in order."""
        stops: List[Dict[str, Any]] = []
        cumulative_km = 0.0
        total_load = 0
        prev = depot
        for i, p in enumerate(pickups, start=1):
            loc = (p["latitude"], p["longitude"])
            leg = haversine_km(*prev, *loc)
            cumulative_km += leg
            total_load += int(math.ceil(p["demand"]))
            stops.append(
                {
                    "id": p["id"],
                    "order": i,
                    "latitude": p["latitude"],
                    "longitude": p["longitude"],
                    "demand_kg": p["demand"],
                    "arrival_distance_km": round(cumulative_km, 2),
                }
            )
            prev = loc
        # Return to depot
        cumulative_km += haversine_km(*prev, *depot)
        total_km = round(cumulative_km, 2)
        est_time = round(total_km / 25 * 60, 1)

        return {
            "optimized_routes": [
                {
                    "vehicle_id": 0,
                    "stops": stops,
                    "total_distance_km": total_km,
                    "total_load_kg": float(total_load),
                    "estimated_time_minutes": est_time,
                    "capacity_utilization_percent": 100.0,
                }
            ],
            "total_distance_km": total_km,
            "total_time_minutes": est_time,
            "total_load_kg": float(total_load),
            "vehicles_used": 1,
            "savings_vs_naive_percent": 0.0,
        }

    @property
    def is_ready(self) -> bool:
        return self._is_ready

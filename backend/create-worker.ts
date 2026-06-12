import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://totzvrmwdnfnyezsgyif.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'sb_publishable_31BcvXHs5-Y3ZATX4Hld7Q_aZux-POz'
);

async function main() {
  const email = 'emp2001@swachhtech.ai';
  const password = 'password123';
  
  // Create user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: 'Test',
        last_name: 'Worker',
        role: 'WORKER'
      }
    }
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return;
  }
  
  console.log("Worker created in Supabase with role WORKER!");
  console.log("Login ID: EMP2001");
  console.log("Password:", password);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

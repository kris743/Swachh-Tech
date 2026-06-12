Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = "c:\Users\HP\Desktop\swachh Tech"
$zipFile = "c:\Users\HP\Desktop\swachh-tech-clean.zip"

Write-Host "Creating clean zip file..."

if (Test-Path $zipFile) { Remove-Item $zipFile }

$archive = [System.IO.Compression.ZipFile]::Open($zipFile, 'Create')

Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\\.next\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.FullName -notmatch '\\\.git\\' -and
    $_.FullName -notmatch '\\\.agents\\' -and
    $_.FullName -notmatch '\\\.gemini\\'
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceDir.Length + 1)
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relativePath)
}

$archive.Dispose()
Write-Host "Zip file created successfully at $zipFile"

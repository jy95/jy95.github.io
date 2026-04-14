# Where Avidemux CLI is stored
$avidemux_cli = "C:\Program Files\Avidemux 2.8 VC++ 64bits\avidemux_cli.exe"
$files_folders = "D:\captures\BOSS"
$avidemux_common_args = @("--video-codec", "copy", "--audio-codec", "copy", "--output-format", "mkv", "--save", "output.mkv")
$search_criteria = "*.mkv"

# Search files in natural order
$foundFiles = @(
    Get-ChildItem -Path $files_folders -Filter $search_criteria |
    Where-Object {!$_.PSIsContainer} |
    Sort-Object { [regex]::Replace($_.Name, '\d+', { $args[0].Value.PadLeft(20) }) }
)

if ($foundFiles.Length -lt 2) {
    Write-Output "Not enough files to generate the command"
} else {
    Set-Location $files_folders

    # Prepare arguments for Avidemux
    $argsList = @("--load", $foundFiles[0].Name)

    foreach ($file in $foundFiles | Select-Object -Skip 1) {
        $argsList += @("--append", $file.Name)
    }

    $argsList += $avidemux_common_args

    # Run Avidemux CLI with the correct arguments
    & "$avidemux_cli" @argsList
}

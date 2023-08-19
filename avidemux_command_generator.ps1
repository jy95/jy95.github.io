# Where Avidemux cli is stored
$avidemux_cli = "C:\Program Files\Avidemux 2.8 VC++ 64bits\avidemux_cli.exe"
$files_folders = "D:\captures\BOSS"
$avidemux_common_args = "-video-codec copy --audio-codec copy --output-format mkv --save output.mkv"
# Kind of file I use
$search_criteria = "*.mkv"
# Search request, to return files in natural order (A1, ..., A10, ...)
$foundFiles = @(
    Get-ChildItem -Path $files_folders -filter $search_criteria |
    Where-Object {! $_.PSIsContainer } |
    Select-Object Name | 
    Sort-Object { [regex]::Replace($_.Name, '\d+', { $args[0].Value.PadLeft(20) }) }
)

if ($foundFiles.Length -lt 2) {
    Write-Output "No enough files to generate the command"
} else {
# First item of the array must be invoked by --load, instead of --append
    $first_file = $foundFiles[0].Name
    $other_files = $foundFiles | Select-Object -Skip 1
    $appendedFiles = @($other_files | ForEach-Object {"--append " + $_.Name}) -join " "
    $command =  '"' + $avidemux_cli + '"' + " --load " + $first_file + " " + $appendedFiles + " " + $avidemux_common_args
    Write-Output $command
}
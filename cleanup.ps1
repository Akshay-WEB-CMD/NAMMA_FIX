$lines = [System.IO.File]::ReadAllLines("d:\bl solutions\index.html")
$before = $lines[0..733]
$after = $lines[1050..($lines.Length - 1)]
$result = $before + $after
[System.IO.File]::WriteAllLines("d:\bl solutions\index.html", $result)
Write-Host "Done. Total lines now: $($result.Length)"

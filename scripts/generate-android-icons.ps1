Param(
  [string]$Source = "c:\\cln\\Drift\\assets\\icon.png"
)

Write-Host "Generating Android icons from: $Source"
if (-not (Test-Path $Source)) {
  Write-Error "Source icon not found: $Source. Place your 1024x1024 icon at Drift/assets/icon.png or pass -Source path."
  exit 1
}

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Drawing2D

function New-ResizedPng {
  param(
    [System.Drawing.Image]$Src,
    [int]$Size,
    [string]$OutPath
  )
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($Src, 0, 0, $Size, $Size)
  $dir = Split-Path $OutPath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

function New-RoundPng {
  param(
    [System.Drawing.Image]$Src,
    [int]$Size,
    [string]$OutPath
  )
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse(0,0,$Size,$Size)
  $g.SetClip($path)
  $g.DrawImage($Src, 0, 0, $Size, $Size)
  $path.Dispose()

  $dir = Split-Path $OutPath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

$srcImg = [System.Drawing.Image]::FromFile($Source)

$proj = "c:\\cln\\Drift\\android\\app\\src\\main\\res"
$targets = @(
  @{ size=48;  dir="mipmap-mdpi" },
  @{ size=72;  dir="mipmap-hdpi" },
  @{ size=96;  dir="mipmap-xhdpi" },
  @{ size=144; dir="mipmap-xxhdpi" },
  @{ size=192; dir="mipmap-xxxhdpi" }
)

foreach ($t in $targets) {
  $dir = Join-Path $proj $t.dir
  New-ResizedPng -Src $srcImg -Size $t.size -OutPath (Join-Path $dir "ic_launcher.png")
  New-RoundPng   -Src $srcImg -Size $t.size -OutPath (Join-Path $dir "ic_launcher_round.png")
  Write-Host " -> $($t.dir) ($($t.size)x$($t.size))"
}

$srcImg.Dispose()
Write-Host "Done. Clean, rebuild, and install the Android app to see the new icon."


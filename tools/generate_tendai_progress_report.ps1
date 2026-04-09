$ErrorActionPreference = 'Stop'

$outDir = 'c:\Users\user\AqualinkTindoe'
$pptPath = Join-Path $outDir 'Tendai_Progress_Report_Optimized.pptx'
$pdfPath = Join-Path $outDir 'Tendai_Progress_Report_Optimized.pdf'

$ppLayoutBlank = 12
$ppSaveAsOpenXMLPresentation = 24
$ppSaveAsPDF = 32
$msoTrue = -1
$msoFalse = 0
$msoTextOrientationHorizontal = 1
$msoShapeRectangle = 1
$msoShapeRoundedRectangle = 5

$theme = @{
  Navy = 0x1B2A41
  Blue = 0xC8472A
  Cyan = 0xD7A43A
  Red = 0x2430B8
  Green = 0x4C8B3B
  Orange = 0x2D6ECF
  Light = 0xF4F5F7
  White = 0xFFFFFF
  Dark = 0x111111
  Grey = 0x7A7A7A
}

$proximate = @(
  @{ Variety='IE 4115'; Moisture=10.868; Ash=3.706; Fibre=5.372; Protein=5.123 },
  @{ Variety='ACC 29'; Moisture=11.546; Ash=3.081; Fibre=3.504; Protein=4.396 },
  @{ Variety='EMIROITE-5'; Moisture=11.412; Ash=2.511; Fibre=4.332; Protein=5.768 },
  @{ Variety='GBK 029646A'; Moisture=11.078; Ash=3.664; Fibre=4.684; Protein=5.747 },
  @{ Variety='ICFX1420421-3-6-1-1'; Moisture=10.597; Ash=2.893; Fibre=4.894; Protein=5.843 },
  @{ Variety='ICFX142591-2-2-1-1'; Moisture=11.596; Ash=2.942; Fibre=4.852; Protein=3.897 },
  @{ Variety='ICFX142608-4-1-1-1'; Moisture=11.012; Ash=2.902; Fibre=5.816; Protein=5.371 },
  @{ Variety='IKHULULE'; Moisture=11.601; Ash=4.282; Fibre=6.637; Protein=4.274 },
  @{ Variety='KACCIMI 42'; Moisture=11.488; Ash=1.154; Fibre=5.395; Protein=4.393 },
  @{ Variety='KAKISEMI 15'; Moisture=10.975; Ash=2.788; Fibre=5.761; Protein=4.994 },
  @{ Variety='KAKISEMI 27'; Moisture=10.726; Ash=3.461; Fibre=3.741; Protein=6.222 },
  @{ Variety='KAKISEMI 35'; Moisture=10.605; Ash=3.272; Fibre=5.479; Protein=6.839 },
  @{ Variety='KAKISEMI 4'; Moisture=11.520; Ash=3.213; Fibre=4.729; Protein=5.401 },
  @{ Variety='KAKISEMI 5'; Moisture=11.218; Ash=2.815; Fibre=5.790; Protein=5.630 },
  @{ Variety='KAKISEMI 6'; Moisture=11.103; Ash=4.740; Fibre=3.953; Protein=3.750 },
  @{ Variety='U-15'; Moisture=10.910; Ash=2.694; Fibre=4.266; Protein=4.365 }
)

$phytochem = @(
  @{ Variety='IE 4115'; Phenol=45.381; Flavonoids=3.427; Tannin=325.218 },
  @{ Variety='ACC 29'; Phenol=52.901; Flavonoids=0.596; Tannin=189.385 },
  @{ Variety='EMIROITE-5'; Phenol=75.263; Flavonoids=0.321; Tannin=631.155 },
  @{ Variety='GBK 029646A'; Phenol=36.742; Flavonoids=1.347; Tannin=418.598 },
  @{ Variety='ICFX1420421-3-6-1-1'; Phenol=33.351; Flavonoids=0.187; Tannin=302.850 },
  @{ Variety='ICFX142591-2-2-1-1'; Phenol=25.925; Flavonoids=0.436; Tannin=229.931 },
  @{ Variety='ICFX142608-4-1-1-1'; Phenol=23.466; Flavonoids=0.351; Tannin=342.078 },
  @{ Variety='IKHULULE'; Phenol=12.431; Flavonoids=0.572; Tannin=111.990 },
  @{ Variety='KACCIMI 42'; Phenol=23.475; Flavonoids=0.333; Tannin=481.383 },
  @{ Variety='KAKISEMI 15'; Phenol=29.887; Flavonoids=0.255; Tannin=171.195 },
  @{ Variety='KAKISEMI 27'; Phenol=37.712; Flavonoids=3.707; Tannin=505.561 },
  @{ Variety='KAKISEMI 35'; Phenol=80.531; Flavonoids=2.112; Tannin=333.261 },
  @{ Variety='KAKISEMI 4'; Phenol=40.610; Flavonoids=0.160; Tannin=330.111 },
  @{ Variety='KAKISEMI 5'; Phenol=53.428; Flavonoids=0.695; Tannin=362.426 },
  @{ Variety='KAKISEMI 6'; Phenol=32.256; Flavonoids=3.750; Tannin=355.384 },
  @{ Variety='U-15'; Phenol=92.511; Flavonoids=2.278; Tannin=407.323 }
)

function Add-TextBox {
  param($slide, [double]$x, [double]$y, [double]$w, [double]$h, [string]$text, [int]$fontSize = 20, [int]$color = 0x111111, [bool]$bold = $false, [int]$align = 1)
  $shape = $slide.Shapes.AddTextbox($msoTextOrientationHorizontal, $x, $y, $w, $h)
  $shape.TextFrame.TextRange.Text = $text
  $shape.TextFrame.TextRange.Font.Size = $fontSize
  $shape.TextFrame.TextRange.Font.Color.RGB = $color
  $shape.TextFrame.TextRange.Font.Bold = $(if ($bold) { $msoTrue } else { $msoFalse })
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = $align
  $shape.TextFrame.WordWrap = $msoTrue
  return $shape
}

function Add-RoundedPanel {
  param($slide, [double]$x, [double]$y, [double]$w, [double]$h, [int]$fillRgb, [int]$lineRgb)
  $shape = $slide.Shapes.AddShape($msoShapeRoundedRectangle, $x, $y, $w, $h)
  $shape.Fill.ForeColor.RGB = $fillRgb
  $shape.Line.ForeColor.RGB = $lineRgb
  $shape.Adjustments.Item(1) = 0.12
  return $shape
}

function Set-SlideBackground {
  param($slide, [int]$rgb)
  $slide.FollowMasterBackground = $msoFalse
  $slide.Background.Fill.ForeColor.RGB = $rgb
  $slide.Background.Fill.Solid()
}

function Add-TitleBand {
  param($slide, [string]$title, [string]$subtitle = '')
  Add-RoundedPanel $slide 18 14 924 40 $theme.Navy $theme.Navy | Out-Null
  Add-TextBox $slide 34 18 700 28 $title 24 $theme.White $true 1 | Out-Null
  if ($subtitle) {
    Add-TextBox $slide 650 18 270 28 $subtitle 11 $theme.Light $false 3 | Out-Null
  }
}

function Add-Bullets {
  param($slide, [double]$x, [double]$y, [double]$w, [double]$h, [string[]]$items, [int]$fontSize = 20, [int]$color = 0x111111)
  $shape = Add-TextBox $slide $x $y $w $h '' $fontSize $color $false 1
  $tr = $shape.TextFrame.TextRange
  $tr.Text = ($items -join "`r")
  for ($i = 1; $i -le $tr.Paragraphs().Count; $i++) {
    $p = $tr.Paragraphs($i)
    $p.ParagraphFormat.Bullet.Visible = $msoTrue
    $p.ParagraphFormat.Bullet.Character = 8226
    $p.ParagraphFormat.SpaceAfter = 4
    $p.Font.Size = $fontSize
    $p.Font.Color.RGB = $color
  }
  return $shape
}

function Add-BarPanel {
  param(
    $slide,
    [double]$x,
    [double]$y,
    [double]$w,
    [double]$h,
    [string]$title,
    $rows,
    [string]$valueKey,
    [int]$barColor,
    [int]$topN = 6,
    [string]$format = '{0:N2}'
  )

  Add-RoundedPanel $slide $x $y $w $h 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide ($x + 12) ($y + 8) ($w - 24) 20 $title 15 $theme.Navy $true 1 | Out-Null

  $sorted = $rows | Sort-Object { [double]$_[$valueKey] } -Descending | Select-Object -First $topN
  $maxValue = [double](($sorted | ForEach-Object { [double]$_[$valueKey] } | Measure-Object -Maximum).Maximum)
  if ($maxValue -le 0) { $maxValue = 1 }

  $rowHeight = (($h - 42) / $topN)
  for ($i = 0; $i -lt $sorted.Count; $i++) {
    $row = $sorted[$i]
    $ry = $y + 30 + ($i * $rowHeight)
    $label = [string]$row['Variety']
    $val = [double]$row[$valueKey]
    Add-TextBox $slide ($x + 10) ($ry + 2) 88 ($rowHeight - 2) $label 9 $theme.Dark $true 1 | Out-Null
    $track = $slide.Shapes.AddShape($msoShapeRectangle, ($x + 100), ($ry + 7), ($w - 180), 10)
    $track.Fill.ForeColor.RGB = 0xE9EDF3
    $track.Line.Visible = $msoFalse
    $barW = [Math]::Max(8, (($w - 180) * ($val / $maxValue)))
    $bar = $slide.Shapes.AddShape($msoShapeRectangle, ($x + 100), ($ry + 7), $barW, 10)
    $bar.Fill.ForeColor.RGB = $barColor
    $bar.Line.Visible = $msoFalse
    Add-TextBox $slide ($x + $w - 74) ($ry + 1) 60 ($rowHeight - 2) ([string]::Format($format, $val)) 9 $theme.Dark $true 3 | Out-Null
  }
}

function Add-SimpleTable {
  param($slide, [double]$x, [double]$y, [double]$w, [double]$h, [string[]]$headers, $rows)
  $table = $slide.Shapes.AddTable($rows.Count + 1, $headers.Count, $x, $y, $w, $h).Table
  for ($c = 1; $c -le $headers.Count; $c++) {
    $cell = $table.Cell(1, $c).Shape
    $cell.Fill.ForeColor.RGB = $theme.Navy
    $cell.TextFrame.TextRange.Text = $headers[$c - 1]
    $cell.TextFrame.TextRange.Font.Color.RGB = $theme.White
    $cell.TextFrame.TextRange.Font.Bold = $msoTrue
    $cell.TextFrame.TextRange.Font.Size = 10
  }
  for ($r = 0; $r -lt $rows.Count; $r++) {
    for ($c = 0; $c -lt $headers.Count; $c++) {
      $value = [string]$rows[$r][$c]
      $cell = $table.Cell($r + 2, $c + 1).Shape
      $cell.TextFrame.TextRange.Text = $value
      $cell.TextFrame.TextRange.Font.Size = 9
      $cell.TextFrame.TextRange.Font.Color.RGB = $theme.Dark
      if (($r % 2) -eq 0) {
        $cell.Fill.ForeColor.RGB = 0xF7F9FC
      } else {
        $cell.Fill.ForeColor.RGB = 0xEEF3F8
      }
    }
  }
}

function Add-StatusChip {
  param($slide, [double]$x, [double]$y, [double]$w, [double]$h, [string]$title, [string]$status, [int]$color)
  Add-RoundedPanel $slide $x $y $w $h 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide ($x + 10) ($y + 12) ($w - 20) 22 $title 14 $theme.Navy $true 1 | Out-Null
  $pill = Add-RoundedPanel $slide ($x + 10) ($y + 44) 94 26 $color $color
  $pill.Line.Visible = $msoFalse
  Add-TextBox $slide ($x + 14) ($y + 48) 86 18 $status 10 $theme.White $true 2 | Out-Null
}

if (Test-Path $pptPath) { Remove-Item $pptPath -Force }
if (Test-Path $pdfPath) { Remove-Item $pdfPath -Force }

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = $msoTrue
$presentation = $ppt.Presentations.Add()
$presentation.PageSetup.SlideWidth = 960
$presentation.PageSetup.SlideHeight = 540

try {
  # Slide 1
  $slide = $presentation.Slides.Add(1, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-RoundedPanel $slide 44 56 872 428 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-RoundedPanel $slide 44 56 872 68 $theme.Navy $theme.Navy | Out-Null
  Add-TextBox $slide 70 80 800 40 'Nutritional Value, Antinutrients and Glycemic Index of Finger Millet Varieties in Kenya' 26 $theme.White $true 1 | Out-Null
  Add-TextBox $slide 70 172 800 34 'Progress Report Presentation' 24 $theme.Red $true 2 | Out-Null
  Add-TextBox $slide 70 222 800 28 'Tendai Murambidzi | AGF421-0499/2025' 18 $theme.Dark $true 2 | Out-Null
  Add-TextBox $slide 70 258 800 36 'Department of Human Nutrition Sciences, JKUAT' 18 $theme.Dark $false 2 | Out-Null
  Add-TextBox $slide 70 328 800 48 'Supervisors: Prof. Anselimo Makokha | Dr. Dorothy Othoo | Prof. Mary Abukutsa-Onyango' 14 $theme.Grey $false 2 | Out-Null

  # Slide 2
  $slide = $presentation.Slides.Add(2, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Why This Study Matters' 'Finger millet progress deck'
  Add-RoundedPanel $slide 28 74 286 176 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-RoundedPanel $slide 337 74 286 176 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-RoundedPanel $slide 646 74 286 176 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide 44 92 250 22 'Food and nutrition security' 16 $theme.Navy $true 2 | Out-Null
  Add-Bullets $slide 44 122 246 100 @(
    'Major staples face climate pressure',
    'Kenya faces undernutrition and diabetes risk',
    'Resilient nutrient-dense crops are needed'
  ) 12 $theme.Dark | Out-Null
  Add-TextBox $slide 353 92 250 22 'Why finger millet' 16 $theme.Navy $true 2 | Out-Null
  Add-Bullets $slide 353 122 246 100 @(
    'Climate-resilient and low-input crop',
    'Good source of fibre, minerals and starch',
    'Contains bioactive compounds with health value'
  ) 12 $theme.Dark | Out-Null
  Add-TextBox $slide 662 92 250 22 'Research gap' 16 $theme.Navy $true 2 | Out-Null
  Add-Bullets $slide 662 122 246 100 @(
    'Limited Kenya-specific variety data',
    'Processing effects are not fully characterized',
    'Local GI data for finger millet foods remain limited'
  ) 12 $theme.Dark | Out-Null
  Add-RoundedPanel $slide 28 274 904 184 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide 44 290 860 24 'Main Objective' 18 $theme.Red $true 1 | Out-Null
  Add-TextBox $slide 44 324 850 58 'Evaluate varietal differences in nutritional composition, antinutrients and bioactive compounds in Kenyan finger millet, and determine how processing methods influence these traits and glycemic index outcomes.' 17 $theme.Dark $false 1 | Out-Null
  Add-TextBox $slide 44 394 860 18 'Presentation note: keep this slide verbal and avoid reading full text.' 11 $theme.Grey $false 1 | Out-Null

  # Slide 3
  $slide = $presentation.Slides.Add(3, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Study Workflow and Current Position' ''
  $boxes = @(
    @{ X=44; Title='Phase 1'; Body='16 varieties screened`nProximate`nMinerals`nAntinutrients`nBioactives'; Color=$theme.Blue },
    @{ X=340; Title='Phase 2'; Body='2 contrasting varieties`nSoaking`nFermentation`nExtrusion'; Color=$theme.Orange },
    @{ X=636; Title='Phase 3'; Body='Finger millet porridge`nIn vivo GI`nBlood glucose response'; Color=$theme.Green }
  )
  foreach ($b in $boxes) {
    Add-RoundedPanel $slide $b.X 142 244 180 0xFFFFFF 0xD8DCE3 | Out-Null
    Add-RoundedPanel $slide ($b.X + 12) 158 90 28 $b.Color $b.Color | Out-Null
    Add-TextBox $slide ($b.X + 18) 164 78 16 $b.Title 12 $theme.White $true 2 | Out-Null
    Add-TextBox $slide ($b.X + 18) 204 206 96 $b.Body.Replace('`n',"`r") 15 $theme.Dark $false 2 | Out-Null
  }
  Add-TextBox $slide 44 362 860 22 'Progress logic for oral presentation' 16 $theme.Navy $true 1 | Out-Null
  Add-Bullets $slide 44 392 860 90 @(
    'Current report should emphasize Phase 1 findings because those have measurable results.',
    'Processing and GI should be presented as the next analytical stage, not overloaded into current results.',
    'Use Phase 1 results to justify selection of candidate varieties for the next phase.'
  ) 13 $theme.Dark | Out-Null

  # Slide 4
  $slide = $presentation.Slides.Add(4, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Progress to Date' ''
  Add-StatusChip $slide 42 104 170 88 'Proposal refined' 'Done' $theme.Green
  Add-StatusChip $slide 226 104 170 88 'Sample collection' 'Done' $theme.Green
  Add-StatusChip $slide 410 104 170 88 'Proximate analysis' 'Done' $theme.Green
  Add-StatusChip $slide 594 104 170 88 'Phytochemicals' 'Done' $theme.Green
  Add-StatusChip $slide 778 104 138 88 'Minerals/fat' 'Pending' $theme.Orange
  Add-StatusChip $slide 134 226 204 88 'Processing trials' 'Next' $theme.Blue
  Add-StatusChip $slide 378 226 204 88 'GI testing' 'Next' $theme.Blue
  Add-StatusChip $slide 622 226 204 88 'Thesis outputs' 'Ongoing' $theme.Red
  Add-RoundedPanel $slide 42 354 874 126 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide 58 370 842 22 'Progress discussion points' 16 $theme.Navy $true 1 | Out-Null
  Add-Bullets $slide 58 398 840 70 @(
    'Current data are strong enough to report clear varietal differences in proximate and phytochemical profile.',
    'The next technical step is to use these results to justify which varieties move into processing studies.',
    'Keep the progress report focused on achieved results plus the immediate analytical next steps.'
  ) 13 $theme.Dark | Out-Null

  # Slide 5
  $slide = $presentation.Slides.Add(5, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Results Overview: Proximate Composition' ''
  Add-BarPanel $slide 28 78 435 172 'Highest protein varieties (%)' $proximate 'Protein' $theme.Red 6 '{0:N2}'
  Add-BarPanel $slide 497 78 435 172 'Highest crude fibre varieties (%)' $proximate 'Fibre' $theme.Green 6 '{0:N2}'
  Add-BarPanel $slide 28 270 435 172 'Highest ash varieties (%)' $proximate 'Ash' $theme.Orange 6 '{0:N2}'
  Add-BarPanel $slide 497 270 435 172 'Highest moisture varieties (%)' $proximate 'Moisture' $theme.Blue 6 '{0:N2}'

  # Slide 6
  $slide = $presentation.Slides.Add(6, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Consolidated Proximate Results Table' '16 varieties'
  $proxRows = @()
  foreach ($row in $proximate) {
    $proxRows += ,@(
      $row.Variety,
      ('{0:N2}' -f $row.Moisture),
      ('{0:N2}' -f $row.Ash),
      ('{0:N2}' -f $row.Fibre),
      ('{0:N2}' -f $row.Protein)
    )
  }
  Add-SimpleTable $slide 24 72 912 402 @('Variety','Moisture (%)','Ash (%)','Crude fibre (%)','Protein (%)') $proxRows

  # Slide 7
  $slide = $presentation.Slides.Add(7, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Results Overview: Phytochemicals and Tannins' ''
  Add-BarPanel $slide 28 86 290 326 'Phenol (mg/100g)' $phytochem 'Phenol' $theme.Red 8 '{0:N1}'
  Add-BarPanel $slide 335 86 290 326 'Flavonoids (g/100g)' $phytochem 'Flavonoids' $theme.Blue 8 '{0:N2}'
  Add-BarPanel $slide 642 86 290 326 'Tannin (mg/100g)' $phytochem 'Tannin' $theme.Orange 8 '{0:N1}'
  Add-RoundedPanel $slide 28 426 904 74 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-Bullets $slide 40 440 880 42 @(
    'U-15 and Kakisemi 35 stand out on total phenol, while Kakisemi 6 and Kakisemi 27 stand out on flavonoids.',
    'Emiroite-5 shows the strongest tannin signal, indicating strong phytochemical activity but also higher antinutrient burden.'
  ) 12 $theme.Dark | Out-Null

  # Slide 8
  $slide = $presentation.Slides.Add(8, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Consolidated Phytochemical Results Table' '16 varieties'
  $phyRows = @()
  foreach ($row in $phytochem) {
    $phyRows += ,@(
      $row.Variety,
      ('{0:N3}' -f $row.Phenol),
      ('{0:N3}' -f $row.Flavonoids),
      ('{0:N3}' -f $row.Tannin)
    )
  }
  Add-SimpleTable $slide 34 82 892 386 @('Variety','Phenol (mg/100g)','Flavonoids (g/100g)','Tannin (mg/100g)') $phyRows

  # Slide 9
  $slide = $presentation.Slides.Add(9, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Key Discussion Points' ''
  Add-RoundedPanel $slide 34 84 428 364 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide 52 100 390 20 'What the current data show' 16 $theme.Navy $true 1 | Out-Null
  Add-Bullets $slide 52 130 380 280 @(
    'Finger millet varieties differ meaningfully in both nutritional and phytochemical composition.',
    'Moisture and ash show relatively tighter clustering, while fibre, protein and phytochemical traits differentiate varieties more strongly.',
    'The data support variety screening as a necessary first step before processing and GI work.',
    'High bioactive potential must be interpreted together with tannin burden, not in isolation.'
  ) 14 $theme.Dark | Out-Null
  Add-RoundedPanel $slide 490 84 436 364 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide 508 100 390 20 'Best discussion points for oral delivery' 16 $theme.Navy $true 1 | Out-Null
  Add-Bullets $slide 508 130 390 280 @(
    'U-15 appears promising due to very high total phenol with acceptable protein performance.',
    'Kakisemi 27 and Kakisemi 6 stand out for flavonoids and may be good contrasting candidates.',
    'Ikhulule is notable for fibre and low phenol/tannin, which may make it useful as a contrasting low-antinutrient comparator.',
    'These trends justify moving to processing trials on selected contrasting varieties rather than all sixteen.'
  ) 14 $theme.Dark | Out-Null

  # Slide 10
  $slide = $presentation.Slides.Add(10, $ppLayoutBlank)
  Set-SlideBackground $slide $theme.Light
  Add-TitleBand $slide 'Next Steps and Reporting Close' ''
  Add-RoundedPanel $slide 38 88 274 308 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-RoundedPanel $slide 344 88 274 308 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-RoundedPanel $slide 650 88 274 308 0xFFFFFF 0xD8DCE3 | Out-Null
  Add-TextBox $slide 56 108 236 20 'Immediate next analyses' 16 $theme.Navy $true 2 | Out-Null
  Add-Bullets $slide 56 142 236 214 @(
    'Complete mineral and fat analysis',
    'Finalize selection of 2 contrasting varieties',
    'Prepare processing experiment materials'
  ) 13 $theme.Dark | Out-Null
  Add-TextBox $slide 362 108 236 20 'Phase 2 direction' 16 $theme.Navy $true 2 | Out-Null
  Add-Bullets $slide 362 142 236 214 @(
    'Apply soaking, fermentation and extrusion',
    'Track changes in tannins, phytates, phenols and flavonoids',
    'Identify the method that best improves nutritional quality'
  ) 13 $theme.Dark | Out-Null
  Add-TextBox $slide 668 108 236 20 'Phase 3 close' 16 $theme.Navy $true 2 | Out-Null
  Add-Bullets $slide 668 142 236 214 @(
    'Run in vivo glycemic index on optimized porridge',
    'Compare blood glucose response with reference food',
    'Use results to support low-GI finger millet recommendations'
  ) 13 $theme.Dark | Out-Null
  Add-TextBox $slide 42 430 860 26 'Close with one sentence: current results confirm strong varietal differences and provide a defensible basis for the next processing and GI stages.' 14 $theme.Red $true 2 | Out-Null

  $presentation.SaveAs($pptPath, $ppSaveAsOpenXMLPresentation)
  $presentation.SaveAs($pdfPath, $ppSaveAsPDF)
}
finally {
  $presentation.Close()
  $ppt.Quit()
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output $pptPath
Write-Output $pdfPath

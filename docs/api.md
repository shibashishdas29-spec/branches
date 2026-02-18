# API Contract

## `POST /api/analyze`

Multipart/form-data:
- `video`: file
- `location`: string
- `speedLimit`: number
- `reportType`: `cctv | citizen | police`

Response includes:
- `id`, `riskStatus`, `detectedObjects`, `severity`, `damageClassification`,
- `speedAlert`, `preventiveMeasures`, `remedialMeasures`, `survivalRate`,
- `footageUrl`, `dateTime`, and metadata.

## `POST /api/authorities/alert`

JSON body:
- `analysisId`, `authorityName`, `authorityEmail`, `immediateMeasures`

Returns generated review summary:
- date/time, place, damage class, measures, and footage link.

## `GET /api/reports/summary`

Returns:
- `severityDistribution`: object with Low/Medium/High counts
- `observations`: latest incident table rows

## `GET /api/simulations`

Returns sample historical/simulation feed list for testing and UI integration.

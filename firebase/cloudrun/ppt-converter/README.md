# PPT Converter Service

Cloud Run service that converts uploaded `ppt/pptx/doc/docx` files in Cloud Storage to PDF using LibreOffice headless.

## Endpoints

- `GET /healthz`
- `POST /convert`

## Request body

```json
{
  "bucketName": "aqualink-b5f7c.firebasestorage.app",
  "sourcePath": "premium_presentations/live123/source/mydeck.pptx",
  "outputPath": "premium_docs/live123/converted/mydeck.pdf"
}
```

## Optional auth

Set `CONVERTER_SHARED_TOKEN` on Cloud Run and send it as `x-converter-token`.

## Example deploy

```powershell
gcloud run deploy aqualink-ppt-converter `
  --source firebase/cloudrun/ppt-converter `
  --region us-central1 `
  --allow-unauthenticated
```

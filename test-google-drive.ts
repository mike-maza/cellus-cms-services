import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'
import * as dotenv from 'dotenv'

dotenv.config()

async function testDrive() {
  console.log('--- Google Drive Test ---')
  console.log('Project ID:', process.env.GOOGLE_PROJECT_ID)
  console.log('Client Email:', process.env.GOOGLE_CLIENT_EMAIL)

  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID
  }

  try {
    const auth = new GoogleAuth({
      projectId: credentials.project_id,
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly'
      ]
    })

    const drive = google.drive({ version: 'v3', auth })

    console.log('Listing files...')
    const q =
      "mimeType='application/vnd.google-apps.spreadsheet' and trashed = false"
    const response = await drive.files.list({
      q,
      fields: 'files(id, name, modifiedTime)',
      pageSize: 10,
      orderBy: 'modifiedTime desc'
    })

    const files = response.data.files || []
    console.log(`Success! Found ${files.length} files.`)
    files.forEach(f => {
      console.log(`- ${f.name} (${f.id})`)
    })

    if (files.length === 0) {
      console.log(
        'Warning: No spreadsheets found. Make sure you shared at least one file with the service account email above.'
      )
    }
  } catch (err: any) {
    console.error('Error during Drive API test:')
    console.error(err.message)
    if (err.errors) console.error(JSON.stringify(err.errors, null, 2))
  }
}

testDrive()

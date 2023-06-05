import axios from 'axios'
import fs from 'fs'
import middleware from './middleware/middleware'
import nextConnect from 'next-connect'
import FormData from 'form-data'

const nftstorageBaseUrl = 'https://api.nft.storage'

const handler = nextConnect()
handler.use(middleware)

export const config = {
  api: {
    bodyParser: false
  }
}

handler.post(async function handlePost ({ body, files }, response) {
  try {
    const fileUrl = await uploadFileToIPFS(files.file[0])
    const metadata = {
      name: body.name[0],
      description: body.description[0],
      image: fileUrl
    }

    const metadaUrl = await uploadJsonToIPFS(metadata, body.name[0])
    return response.status(200).json({
      url: metadaUrl
    })
  } catch (error) {
    console.log('Error uploading file: ', error)
  }
})

async function uploadFileToIPFS (data) {
  const formData = new FormData()
  formData.append('file', fs.createReadStream(data.path), data.originalFileName)

  try {
    const { data: responseData } = await axios.post(`${nftstorageBaseUrl}/pinning/pinFileToIPFS`, formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        nftstorage_api_key: process.env.NFTSTORAGE_API_KEY,
        nftstorage_secret_api_key: process.env.NFTSTORAGE_SECRET_KEY
      }
    })
    const url = `https://ipfs.io/ipfs/${responseData.IpfsHash}?filename=${data.originalFilename}`
    return url
  } catch (error) {
    console.log(error)
  }
}
async function uploadJsonToIPFS (json, fileName) {
  try {
    const { data: responseData } = await axios.post(`${nftstorageBaseUrl}/pinning/pinJSONToIPFS`, json, {
      headers: {
        nftstorage_api_key: process.env.NFTSTORAGE_API_KEY,
        nftstorage_secret_api_key: process.env.NFTSTORAGE_SECRET_KEY
      }
    })
    const url = `https://ipfs.io/ipfs/${responseData.IpfsHash}?filename=${fileName}`
    return url
  } catch (error) {
    console.log(error.response.data)
  }
}

export default handler

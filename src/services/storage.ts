import axios from 'axios'

export const storage = axios.create({
  baseURL: 'https://api.nft.storage',
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN}`
  }
})

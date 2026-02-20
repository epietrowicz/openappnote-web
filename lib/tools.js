import { supabaseService } from '@/lib/db'
import * as z from 'zod'
import { tool } from 'langchain'
import axios from 'axios'
import qs from 'node:querystring'

const DIGIKEY_CLIENT_ID = process.env.DIGIKEY_CLIENT_ID
const DIGIKEY_CLIENT_SECRET = process.env.DIGIKEY_CLIENT_SECRET
const DIGIKEY_API_URL = 'https://api.digikey.com'

const DIGITAL_SPACES_URL = 'https://sfo3.digitaloceanspaces.com'
const DIGITAL_SPACES_BUCKET = 'openappnote-designs'

export const countSimilarDesigns = tool(
  async ({ partNumber }) => {
    const { count, error } = await supabaseService
      .from('design')
      .select('*', { count: 'exact', head: true })
      .textSearch('search_doc', partNumber, { type: 'websearch' })
    if (error) {
      console.log(error)
      return []
    }
    return count
  },
  {
    name: 'count_similar_designs',
    description: 'Count the number of known designs that use the given part number',
    schema: z.object({
      partNumber: z.string().describe('The part number to count similar designs for')
    })
  }
)

export const getBillOfMaterials = tool(
  async ({ designPath }) => {
    const url = `${DIGITAL_SPACES_URL}/${DIGITAL_SPACES_BUCKET}/${designPath}/bom.csv`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to get bill of materials: ${response.statusText}`)
    }
    const text = await response.text()
    return text
  },
  {
    name: 'get_bill_of_materials',
    description: 'Get the bill of materials for the given design',
    schema: z.object({
      designPath: z.string().describe('The design path to get the bill of materials for')
    })
  }
)

const getDigiKeyToken = async () => {
  try {
    const tokenUrl = `${DIGIKEY_API_URL}/v1/oauth2/token`
    const body = qs.stringify({
      client_id: DIGIKEY_CLIENT_ID,
      client_secret: DIGIKEY_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })

    const { data: tokenData } = await axios.post(tokenUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return tokenData.access_token
  } catch (error) {
    console.error('Error getting DigiKey token:', error)
    return null
  }
}

export const getDigiKeyPricing = tool(
  async ({ partNumber }) => {
    try {
      const token = await getDigiKeyToken()
      const url = `${DIGIKEY_API_URL}/products/v4/search/${partNumber}/pricing`

      const { data: productData } = await axios.get(url, {
        headers: {
          'X-DIGIKEY-Client-Id': DIGIKEY_CLIENT_ID,
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      return productData
    } catch (e) {
      console.error('Error getting DigiKey pricing:', e)
      throw new Error('Error getting DigiKey pricing')
    }
  },
  {
    name: 'get_digikey_pricing',
    description: 'Get the pricing for the given part number',
    schema: z.object({
      partNumber: z.string().describe('The part number to get the pricing for')
    })
  }
)

export const searchDigiKey = tool(
  async ({ partNumber }) => {
    const token = await getDigiKeyToken()
    try {
      const url = `${DIGIKEY_API_URL}/products/v4/search/keyword`
      const { data: productData } = await axios.post(
        url,
        {
          Keywords: partNumber, // or `keywords` depending on DigiKey spec
          Limit: 5
        },
        {
          headers: {
            'X-DIGIKEY-Client-Id': DIGIKEY_CLIENT_ID,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      return productData
    } catch (e) {
      console.error('Error getting DigiKey alternatives:', e)
      throw new Error('Error getting DigiKey alternatives')
    }
  },
  {
    name: 'search_digikey',
    description: 'Search DigiKey for the given keyword',
    schema: z.object({
      partNumber: z.string().describe('The keyword to search for')
    })
  }
)

import axios from 'axios'

export const getIPGeolocation = async (ip: string) => {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`)

    const { city, country, countryCode, region } = response.data

    return {
      city: city || 'Unknown',
      country: country || 'Unknown',
      countryCode: countryCode || 'XX',
      region: region || 'Unknown',
      formatted: `${city}, ${country}, ${region}`
    }
  } catch (error) {
    console.error('Error al obtener geolocalización:', error)
    return {
      city: 'Unknown',
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      formatted: 'Unknown'
    }
  }
}

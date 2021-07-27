import axios from 'axios'
import qs from 'qs'

// create axios instance
const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/v1/attractions",
    timeout: 5000, // 5000ms = 5s
})

const attractionsAPI = {
    
    search: (location) => {
        return axiosInstance.get(`/singapore/${location}`)
    },
}

export default attractionsAPI
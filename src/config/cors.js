import { clientHost, serverHost } from '../utilities/constants'

export const corsConfig = {
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    origin: [...clientHost, serverHost]
}

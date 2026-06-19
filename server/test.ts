import {corsair} from "./corsair"

const main = async () => {
    const res = await corsair.withTenant('6jQ28OXhEnPENtsK5IQWTna5RfRumZt3').gmail.api.threads.list({})
    console.log(res)
} 

main()
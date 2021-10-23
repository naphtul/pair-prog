const fastify = require('fastify')({ logger: true });
const got = require('got');
const NASA_APIKEY = process.env.NASA_APIKEY;


fastify.route({
    method: 'GET',
    url: '/',
    schema: {
        // request needs to have a querystring with a `name` parameter
        querystring: {
            name: { type: 'string' }
        },
        // the response needs to be an object with an `hello` property of type 'string'
        response: {
            200: {
                type: 'object',
                properties: {
                    hello: { type: 'string' }
                }
            }
        }
    },
    // this function is executed for every request before the handler is executed
    preHandler: async (request, reply) => {
        // E.g. check authentication
    },
    handler: async (request, reply) => {
        let nasaRes;
        try {
            nasaRes = await got.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_APIKEY}`).json();
        } catch (e) {
            return {message: 'error with the NASA API', code: 500, error: e.toString()}
        }
        let titleLetter;
        if (nasaRes.hasOwnProperty('title')) {
            titleLetter = nasaRes.title.split(': ')[1][0].toLowerCase();
        }
        let pokeRes;
        try {
            pokeRes = await got.get(`https://pokeapi.co/api/v2/pokemon?limit=100&offset=200`).json();
        } catch (e) {
            return {message: 'error with the Pokemon API', code: 500, error: e.toString()}
        }
        let chosenPokemon;
        for (const pokemon of pokeRes.results) {
            if (pokemon.name.indexOf(titleLetter) === 0) {
                chosenPokemon = pokemon;
                break;
            }
        }
        return JSON.stringify({
            planetary: nasaRes,
            chosenPokemon
        });
    }
})

const start = async () => {
    try {
        await fastify.listen(3000)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()

'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

'use strict'

const Route = use('Route')
const ApolloServer = use('ApolloServer')
const Faker = use('Faker')

const { makeExecutableSchema } = require('graphql-tools')

const typeDefs = [`

schema {
    query: Query
    # mutation: Mutation
    # subscription: Subscription
}
# The query type, represents all of the entry points into our object graph
type Query {
    #search(text: String!): [SearchResult]!
    flyer(id: ID!): Flyer
    store(id: ID!): Store
    merchant(id: ID!): Merchant
    consumer(id: ID!): Consumer
}

# A user from the application
interface User {
    # The ID of the user
    id: ID!
    # The name of the user
    name: String!
}

# Units of length
enum LengthUnit {
    # The standard unit around the world
    METER
    # Primarily used in the United States
    FOOT
}
# Units of money
enum MoneyUnit {
    # The standard unit around the EU
    EUR
    # Primarily used in the United States
    USD
}
# States of flyer
enum FlyerState {
    NOTUSED
    USED
}

# A merchant
type Merchant implements User {
    # The ID of the merchant
    id: ID!
    # The name of the merchant
    name: String!

    # Budget in the preferred unit, default is EUR
    budget(unit: MoneyUnit = EUR): Float!
    
    # Belonging stores
    stores: [Store]
    # The stores of the merchant exposed as a connection with edges
    storesConnection(first: Int, after: ID): StoresConnection!
}

###################################################################
# A connection object for a merchant's stores
type StoresConnection {
    # The total number of stores
    totalCount: Int!
    # The edges for each of the merchant's stores.
    edges: [StoresEdge]
    # A list of the stores, as a convenience when edges are not needed.
    stores: [Store]
    # Information for paginating this connection
    pageInfo: PageInfo!
}
# An edge object for a merchant's stores
type StoresEdge {
    # A cursor used for pagination
    cursor: ID!
    # The merchant represented by this store edge
    node: Merchant
}
###################################################################

# A consumer which uses the merchants' flyers
type Consumer implements User {
    # The ID of the consumer
    id: ID!
    # The name of the consumer
    name: String!
    
    # This consumer's friends, or an empty list if they have none
    #friends: [User]
    # The friends of the user exposed as a connection with edges
    #friendsConnection(first: Int, after: ID): FriendsConnection!

    # Belonging flyers
    flyers: [Flyer]
    # The flyers of the user exposed as a connection with edges
    flyersConnection(first: Int, after: ID): FlyersConnection!
}

###################################################################
# A connection object for a user's flyers
type FlyersConnection {
    # The total number of flyers
    totalCount: Int!
    # The edges for each of the character's flyers.
    edges: [FlyersEdge]
    # A list of the flyers, as a convenience when edges are not needed.
    flyers: [Flyer]
    # Information for paginating this connection
    pageInfo: PageInfo!
}
# An edge object for a user's flyers
type FlyersEdge {
    # A cursor used for pagination
    cursor: ID!
    # The user represented by this flyer edge
    node: User
}
# Information for paginating this connection
type PageInfo {
    startCursor: ID
    endCursor: ID
    hasNextPage: Boolean!
}
###################################################################



type Flyer {
    # The ID of the consumer
    id: ID!
    # The name of the flyer
    name: String!

    # State of the flyer
    state: FlyerState
    #canBeUsed: [Store]!
}
type Store {
    # The ID of the consumer
    id: ID!
    # The name of the flyer
    name: String!

    # Location
    location: Location

    #radius(unit: LengthUnit = METER): Float
}
type Location {
    name: String
    long: Float!
    lat: Float!
}

`];

var fakeDb = {
    users: [],
    stores: {
        getStoreById: function (id, data) {
            return data.filter(
                function (data) { return data.id == id }
            )
        },
        data: [
            {
                id: "1",
                name: Faker.name.firstName() + '\'s ' + Faker.commerce.department(),
                location: {
                    name: Faker.address.city(),
                    long: Faker.address.longitude(),
                    lat: Faker.address.longitude(),
                }
            }
        ],
    }
}


const resolvers = {
    Query: {
        flyer(root, { id }, context) {
            return 'world';
        },
        store(root, { id }, context) {
            return fakeDb.stores.getStoreById(id, fakeDb.stores.data);
        },
        merchant(root, { id }, context) {
            return 'world';
        },
        consumer(root, { id }, context) {
            return 'world';
        },
    }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

Route.route('/graphql', ({ request, response }) => {
    return ApolloServer.graphql({ schema }, request, response)
}, ['GET', 'POST'])

Route.get('/graphiql', ({ request, response }) => {
    return ApolloServer.graphiql({ endpointURL: '/graphql' }, request, response)
})
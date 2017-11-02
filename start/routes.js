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
var _ = require('lodash');
//const { find, filter } = require('lodash');

const { makeExecutableSchema } = require('graphql-tools')

const typeDefs = [`

schema {
    query: Query
    # mutation: Mutation
    # subscription: Subscription
}
# The query type, represents all of the entry points into our object graph
type Query {
    allFlyers: [Flyer]
    allStores: [Store]
    allMerchants: [Merchant]
    allConsumers: [Consumer]

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

    # The owner store
    store: Store!

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

    # Belonging flyers
    flyers: [Flyer]
    # The flyers of the user exposed as a connection with edges
    flyersConnection(first: Int, after: ID): FlyersConnection!
}
type Location {
    name: String
    long: Float!
    lat: Float!
}

`];

var fakeDb = {
    users: {
        merchants: [
            {
                id: 'm1',
                name: Faker.name.findName(),
                budget: 100,
                stores: ['s1', 's2'],
            },
            {
                id: 'm2',
                budget: 500,
                name: Faker.name.findName(),
                stores: ['s3', 's4'],
            }
        ],
        consumers: [
            {
                id: 'c1',
                name: Faker.name.findName(),
                firends: ['c2'],
                flyers: ['f1', 'f2', 'f3'],
            },
            {
                id: 'c2',
                name: Faker.name.findName(),
                firends: ['c1'],
                flyers: ['f2', 'f3', 'f4'],
            }
        ],
    },
    stores: [
        {
            id: 's1',
            name: Faker.name.firstName() + '\'s ' + Faker.commerce.department(),
            location: {
                name: Faker.address.city(),
                long: Faker.address.longitude(),
                lat: Faker.address.longitude(),
            },
            flyers: ['f1', 'f2', 'f3', 'f4']
        },
        {
            id: 's2',
            name: Faker.name.firstName() + '\'s ' + Faker.commerce.department(),
            location: {
                name: Faker.address.city(),
                long: Faker.address.longitude(),
                lat: Faker.address.longitude(),
            },
            flyers: ['f5', 'f6']
        },
        {
            id: 's3',
            name: Faker.name.firstName() + '\'s ' + Faker.commerce.department(),
            location: {
                name: Faker.address.city(),
                long: Faker.address.longitude(),
                lat: Faker.address.longitude(),
            },
            flyers: ['f7', 'f8']
        },
        {
            id: 's4',
            name: Faker.name.firstName() + '\'s ' + Faker.commerce.department(),
            location: {
                name: Faker.address.city(),
                long: Faker.address.longitude(),
                lat: Faker.address.longitude(),
            },
            flyers: ['f9']
        },
    ],
    flyers: [
        {
            id: 'f1',
            storeId: 's1',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f2',
            storeId: 's1',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f3',
            storeId: 's1',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f4',
            storeId: 's1',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f5',
            storeId: 's2',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f6',
            storeId: 's2',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f7',
            storeId: 's3',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f8',
            storeId: 's3',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
        {
            id: 'f9',
            storeId: 's4',
            name: Faker.commerce.productName(),
            state: 'NOTUSED'
        },
    ]
}

const resolvers = {
    Query: {
        allFlyers: (_, { id }) => fakeDb.flyers,
        allStores: (_, { id }) => fakeDb.stores,
        allMerchants: (_, { id }) => fakeDb.merchants,
        allConsumers: (_, { id }) => fakeDb.consumers,

        flyer: (_, { id }) => fakeDb.flyers.find(a => a.id === id),
        store: (_, { id }) => fakeDb.stores.find(a => a.id === id),
        merchant: (_, { id }) => fakeDb.users.merchants.find(a => a.id === id),
        consumer: (_, { id }) => fakeDb.users.consumers.find(a => a.id === id),
    },

    User: {
        __resolveType(obj, context, info) {
            if (obj.budget) {
                return 'Merchant';
            } else {
                return 'User';
            }
            return null;
        },
    },
    Consumer: {
        flyers(consumer) {
            return _(fakeDb.flyers)
                .keyBy('id')
                .at(consumer.flyers)
                .value()
        },
    },
    Merchant: {
        stores(merchant) {
            return _(fakeDb.stores)
                .keyBy('id')
                .at(merchant.stores)
                .value()
        },
    },
    Store: {
        flyers(store) {
            return _(fakeDb.flyers)
                .keyBy('id')
                .at(store.flyers)
                .value()
        },
    },
    Flyer: {
        store: (flyer) => fakeDb.stores.find(a => a.id === flyer.storeId ),
    },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

Route.route('/graphql', ({ request, response }) => {
    return ApolloServer.graphql({ schema }, request, response)
}, ['GET', 'POST'])

Route.get('/graphiql', ({ request, response }) => {
    return ApolloServer.graphiql({ endpointURL: '/graphql' }, request, response)
})
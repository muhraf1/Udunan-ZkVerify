export default `#graphql
enum CategoryStatus {
  Emergency
  Healthcare
  Education
  Animal
  Others
}


type Content {
  id: ID!
  title: String!
  isVerified: Boolean
  currentAmount: Float
  targetAmount: Float
  donationCount: Int
  category: CategoryStatus!
  location: String!
  address: String
  organizationName: String
  organizationNameId: String!
  organization: User!
  imageSrc: String
  dayLeft: Int
  description: String
  startDate: String
  endDate: String
  userId: String!
  user: User!
  donations: [Donate!]
  withdrawals: [Withdraw!]
  fundraises: [Fundraise!]
  createdAt: String!
  updatedAt: String!
}

type Fundraise {
  id: ID!
  title: String!
  description: String
  fundimg: String!
  authorId: String!
  author: User!
  contentId: String!
  content: Content!
  createdAt: String!
  updatedAt: String!
}

type Donate {
  id: ID!
  tx_hash: String!
  amount: Float!
  msg: String
  donorId: String!
  donor: User!
  contentId: String!
  attestationId: String
  content: Content!
  fromAddress: String!
  toAddress: String!
  createdAt: String!
  updatedAt: String!
}

type Withdraw {
  id: ID!
  tx_hash: String!
  amount: Float!
  title: String!
  description: String!
  contentId: String!
  content: Content!
  fromAddress: String!
  toAddress: String!
  createdAt: String!
  updatedAt: String!
}


type User {
  id: ID!
  email: String
  userId: String
  orgId: String
  address: String
  bio: String
  type: String
  name: String
  userimg: String
  X: String
  instagram: String
  linkedin: String
  telegram: String
  youtube: String
  website: String
  fundraises: [Fundraise!]
  donations: [Donate!]
  createdContents: [Content!]
  organizationContents: [Content!]
  createdAt: String
  updatedAt: String
}

type AuthPayload {
  token: String!
  user: User!
}

type Query {
  contents(take: Int, skip: Int): [Content!]!
  content(id: ID!): Content
  contentsByCategory(category: CategoryStatus!, take: Int, skip: Int): [Content!]!
  contentsByLocation(location: String!, take: Int, skip: Int): [Content!]!
  contentdashbord: [Content!]!
  
  fundraises(take: Int, skip: Int): [Fundraise!]!
  fundraise(id: ID!): Fundraise
  fundraisesByContent(contentId: ID!, take: Int, skip: Int): [Fundraise!]!
  fundraisesByAuthor(authorId: String!, take: Int, skip: Int): [Fundraise!]!
  fundraisedashboard(take: Int, skip: Int): [Fundraise!]!

  donations(take: Int, skip: Int): [Donate!]!
  donationsByContent(contentId: ID!): [Donate!]!
  donationsByUser(userId: ID!): [Donate!]!
  withdrawals(take: Int, skip: Int): [Withdraw!]!
  withdrawalsByContent(contentId: ID!): [Withdraw!]!
  userprofile(id: ID!): User
  usermanage: User
  me: User
}

type Mutation {
  register(email: String!, userId: String, orgId: String, type: String, address: String): AuthPayload!
  login(email: String!): AuthPayload!
  loginByAddress(address: String!): AuthPayload!
   registerByAddress(address: String!): AuthPayload!

  createContent(
    title: String!
    category: CategoryStatus!
    location: String
    isVerified: Boolean
    address: String
    organizationNameId: String!
    organizationName: String
    imageSrc: String
    description: String
    startDate: String!
    endDate: String!
    targetAmount: Float!
    dayLeft: Int
  ): Content!

  updateContent(
    id: ID!
    title: String
    category: CategoryStatus
    location: String
    address: String
    organizationName: String
    imageSrc: String
    description: String
    startDate: String
    endDate: String
    targetAmount: Float
  ): Content!

  deleteContent(id: ID!): Content!

  createFundraise(
    title: String!
    description: String
    fundimg: String
    authorId: String!
    contentId: String!
  ): Fundraise!

  updateFundraise(
    id: ID!
    title: String
    description: String
    fundimg: String
  ): Fundraise!

  deleteFundraise(id: ID!): Fundraise

  createDonate(
    contentId: String!
    amount: Float!
    msg: String
    tx_hash: String!
    fromAddress: String!
    toAddress: String!
    attestationId: String
  ): Donate!

  createWithdraw(
    contentId: String!
    amount: Float!
    title: String!
    description: String!
    tx_hash: String!
    fromAddress: String!
    toAddress: String!
  ): Withdraw!

 updateUser(
    id: ID!
    name: String
    bio: String
    userimg: String
    X: String
    instagram: String
    linkedin: String
    telegram: String
    youtube: String
    website: String
  ): User!

  

 
}
`;

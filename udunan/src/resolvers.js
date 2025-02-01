import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; // Ensure jwt is installed
const prisma = new PrismaClient();
import dotenv from 'dotenv';
dotenv.config();

const resolvers = {

  Query: {

    contents: async (_, __, { prisma }) => {
      const contents = await prisma.content.findMany({
        include: {
          user: true,
          fundraises: {
            include: {
              author: true // This will include the author details
            }
          }
        }
      });
    
      return contents.map(content => {
        const today = new Date();
        const endDateTime = new Date(Number(content.endDate)); // Convert from string to number first if needed
        const timeDiff = endDateTime.getTime() - today.getTime();
        const dayLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
        
        return {
          ...content,
          dayLeft: dayLeft
        };
      });
    },

    content: async (_, { id }, { prisma }) => {
      const content = await prisma.content.findUnique({
        where: { id },
        include: {
          user: true,
          fundraises: true,
          donations: true,
          withdrawals: true
        }
      });
    
      if (!content) {
        return null; // or throw an error if content not found
      }
    
      const today = new Date();
      const endDateTime = new Date(Number(content.endDate)); // Convert from string to number first if needed
      const timeDiff = endDateTime - today;
      const dayLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
      return {
        ...content,
        dayLeft: dayLeft
      };
    },

    contentsByCategory: async (_, { category, take, skip }) => {
      return prisma.content.findMany({
        where: { category },
        take,
        skip,
        include: {
          user: true,
          organization: true,
          donations: true,
          withdrawals: true,
          fundraises: true
        }
      });
    },

    contentsByLocation: async (_, { location, take, skip }) => {
      return prisma.content.findMany({
        where: { location },
        take,
        skip,
        include: {
          user: true,
          organization: true,
          donations: true,
          withdrawals: true,
          fundraises: true
        }
      });
    },

    fundraisedashboard: async (_, __, {
      user
    }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await prisma.fundraise.findMany({
        where: {
          authorId: user.id,
        },
        include: {
          author: true,
          content: true
        }
      });
    },

    contentdashbord: async (_, __, {
      user
    }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await prisma.content.findMany({
        where: {
          organizationNameId: user.id
        },
        include: {
          user: true,
          fundraises: {
            include: {
              author: true // This will include the author details
            }
          }
          
        }
      });
    },

    fundraises: async (_, { take, skip }) => {
      return prisma.fundraise.findMany({
        take,
        skip,
        include: {
          author: true,
          content: true
        }
      });
    },

    fundraise: async (_, { id }) => {
      return prisma.fundraise.findUnique({
        where: { id },
        include: {
          author: true,
          content: true
        }
      });
    },

    donations: async (_, { take, skip }) => {
      return prisma.donate.findMany({
        take,
        skip,
        include: {
          donor: true,
          content: true
        }
      });
    },

    withdrawals: async (_, { take, skip }) => {
      return prisma.withdraw.findMany({
        take,
        skip,
        include: {
          content: true
        }
      });
    },

    userprofile: async (_, { id }) => {
      return prisma.user.findUnique({
        where: { id },
        include: {
          fundraises: {
            where: {
              authorId: id
            }
          },
          donations: true,
     
          createdContents: {
            where: {
              userId: id
            }
          },
          organizationContents: true
        }
      });
    },

    usermanage: async (_, __, {
      user
    }) => {
      try {
        if (!user || !user.id) {
          return null; // Explicitly return null if user or user.id is missing
        }

        // Fetch the user if the user object is valid
        return await prisma.user.findUnique({
          where: {
            id: user.id
          },
          include: {
  
            createdContents: true,
            donations: true,
            fundraises: true
          }
        });
      } catch (error) {
        console.error('Error in usermanage:', error); // Log the error for debugging
        return null; // Ensure null is returned on error
      }
    },
  

    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return user;
    }
  },

  Mutation: {
    createContent: async (_, args, { user, prisma }) => {
      // Authentication check
      if (!user) throw new Error('Not authenticated');
    
      // Validate target amount
      const parsedTargetAmount = parseFloat(args.targetAmount);
      if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
        throw new Error('Invalid target amount');
      }

      // Validate and parse dates
      const parsedStartDate = new Date(args.startDate);
      const parsedEndDate = new Date(args.endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      if (parsedEndDate <= parsedStartDate) {
        throw new Error('End date must be after start date');
      }
    
     
    
      // Fetch current user for organization name
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true }
      });
    
      if (!currentUser) {
        throw new Error('User not found in the database');
      }
       // Calculate days left
       const today = new Date();
       const endDateTime = parsedEndDate.getTime();
       const todayTime = today.getTime();
       const dayLeft = Math.max(
         0,
         Math.ceil((endDateTime - todayTime) / (1000 * 60 * 60 * 24))
       );
    
      return prisma.content.create({
        data: {
          title: args.title,
          category: args.category,
          location: args.location,
          address: args.address,
          imageSrc: args.imageSrc,
          isVerified: args.isVerified,
          description: args.description,
          organizationNameId:args.organizationNameId,
          organizationName: currentUser.name,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          targetAmount: parsedTargetAmount,
          currentAmount: 0,
          donationCount: 0,
          dayLeft: dayLeft,
          userId: currentUser.id,
        },
        include: {
          user: true,
          organization: true,
          donations: true,
          withdrawals: true,
          fundraises: true
        }
      });
    },

    updateUser: async (_, { id, name, ...args }, { prisma }) => {
      try {
        // Update the user first
        const updatedUser = await prisma.user.update({
          where: { id: id },
          data: {
            name: name,
            ...args
          },
        });

        // If name was updated, update organizationName in Content
        if (name !== undefined) {
          await prisma.content.updateMany({
            where: {
              organizationNameId: id,
            },
            data: {
              organizationName: name,
            },
          });
        }
        console.log (updatedUser);
        return updatedUser;
      
      } catch (error) {
        console.error('Failed to update user:', error);
        throw new Error('Could not update user');
      }
    },

    updateContent: async (_, { id, ...args }) => {
      return await prisma.content.update({
        where: {
          id: id
        },
        data: {
          ...args,
          ...(args.startDate && !isNaN(Date.parse(args.startDate)) && {
            startDate: new Date(args.startDate)
          }),
          ...(args.endDate && !isNaN(Date.parse(args.endDate)) && {
            endDate: new Date(args.endDate)
          }),
        },
      });
    },

    createDonate: async (_, args, { user }) => {

      if (!user) throw new Error('Not authenticated');

      const content = await prisma.content.findUnique({
        where: { id: args.contentId }
      });

      return prisma.donate.create({
        data: {
          ...args,
          donorId: user.id
        },
        include: {
          donor: true,
          content: true
        }
      });
    },

    createWithdraw: async (_, args, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const content = await prisma.content.findUnique({
        where: { id: args.contentId }
      });
      if (!content || content.userId !== user.id) {
        throw new Error('Not authorized');
      }

      return prisma.withdraw.create({
        data: args,
        include: {
          content: true
        }
      });
    },


  // Fundraise Mutations
  createFundraise: async (_, { title, description, contentId, authorId, fundimg }, { prisma, user }) => {
    // Ensure the user is authenticated
    if (!user || !user.id) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Validate contentId
    
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        throw new Error('Content not found');
      }
  
      // Create the fundraise
      const fundraise = await prisma.fundraise.create({
        data: {
          title,
          description,
          authorId,
          contentId,
          fundimg
        },
        include: {
          author: true,
          content: true
        }
      });
  
      return fundraise;
    } catch (error) {
      console.error('❌ Error in createFundraise:', error);
      throw new Error(error.message || 'Failed to create fundraise');
    }
  },


  updateFundraise: async (_, {
    id,
    ...args
  }) => {
    return await prisma.fundraise.update({
      where: {
        id: id
      },
      data: {
        ...args,
      },
    });
  },

  deleteFundraise: async (_, {
    id
  }) => {
    return await prisma.fundraise.delete({
      where: {
        id: parseInt(id)
      },
    });
  },


 
  

    login: async (_, { email }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          throw new Error('User not found');
        }

        const token = jwt.sign(
          { 
            userid: user.id,
            email: user.email
           
          },
          process.env.JWT_SECRET,
          { expiresIn: '7h' }
        );

        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
    

    register: async (_, { email, userId, orgId, address ,type}) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
    
        if (existingUser) {
          throw new Error('User already exists');
        }
    
        // Generate default values if fields are not provided
      
        const newName = address || '';
        const placeholder = 'kosong';
     
    
        const user = await prisma.user.create({
          data: { 
            email,
            userId,
            orgId,
            address,
            type,
            name: newName,
            userimg: placeholder,
          }
        });
    
        const token = jwt.sign(
          { email: user.email, userid: user.id, orgId: user.orgId, address: user.address, type: user.type, Name: newName },
          process.env.JWT_SECRET,
          { expiresIn: '7h' }
        );
    
        return { token, user };
      } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Failed to register');
      }
    },
    
    
  }
};

export default resolvers;
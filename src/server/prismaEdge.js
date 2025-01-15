import { PrismaClient as Edge } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

let prismaEdge;

if (process.env.NODE_ENV === 'production') {
  prismaEdge = new Edge().$extends(withAccelerate());
} else {
  if (!global.prismaEdge) {
    global.prismaEdge = new Edge().$extends(withAccelerate());
  }
  prismaEdge = global.prismaEdge;
}

export default prismaEdge;

/* eslint-disable import/no-mutable-exports */

import  { Schema,model } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref:'User'
    },
    jwt:String
  },
  { timestamps: true },
);


const Sessions = model('Sessions', sessionSchema);

export default Sessions;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Name is required for creating a user"]
    },
    email:{
        type:String,
        lowercase:true,
        required:[true, "Email is required for creating a user"],
        unique:true,
        trim:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password:{
        type:String,
        required:[true, "Password is required for creating a user"],
        minLength:[6, "Password must have atleast 6 characters"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        select:false,
        immutable: true
    }
},{
    timestamps:true
})

userSchema.pre("save", async function(){
    if(!this.isModified){
        return
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    return
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare( password, this.password)
}

const User = mongoose.model("User", userSchema)

export default User
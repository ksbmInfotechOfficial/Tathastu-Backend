const fs = require('fs').promises

const deleteFile = async(filename)=>{
    try{

    await fs.unlink(filename)
    console.log('File deleted successfully')

    }

    catch(err){
        console.log(err.message)
    }
}


module.exports = {deleteFile};
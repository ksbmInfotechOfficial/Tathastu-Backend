// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const verifyToken = (req, res, next)=>{
//     const token = req.body.token || req.query.token || req.headers['authorization'];

//     if(!token){
//         return res.status(403).json({
//             success: false,
//             message: 'A token required for authentication'
//         })
//     }


//     try{

//         const bearer = token.split(' ');

//         const bearerToken = bearer[1];
//         const decodedData = jwt.verify(bearerToken, process.env.JWT_SECRET)

//         req.user = decodedData;

//     }

//     catch(error){
//         return res.status(500).json({
//             success: false,
//             message: 'Invalid token'
//         })
//     }


//     return next();


// }


// module.exports = verifyToken;



const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'] || req.body.token || req.query.token;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'A token is required for authentication'
    });
  }

  try {
    // Handle "Bearer <token>" format
    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = verifyToken;

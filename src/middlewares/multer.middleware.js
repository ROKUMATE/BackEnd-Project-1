import multer from "multer";

const storage = multer.diskStorage({
    // Multer Only have the file
    // cb is callback {Parenthesis wala callback}
    // function () {}
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // cb(null, file.fieldname + "-" + uniqueSuffix);
        cb(null, file.originalname);
    },
});

export const upload = multer({ storage });

// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {

//       cb(null, file.originalname)
//     }
//   })

// export const upload = multer({
//     storage,
// })

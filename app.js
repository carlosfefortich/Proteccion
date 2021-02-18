const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
var imageAspectRatio = require("image-aspect-ratio");
const sizeOf = require('image-size');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.static('./public'));

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, callback){
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single('myImage');


app.get('/', (req,res)=>{
    res.render('index')
});

app.post('/resize', (req, res)=>{
    upload(req, res, (err) =>{
        if(err){
            res.render('index', {
                msg: err
            });
        }else{
            const img = req.file;
            const imgOriginalDimensions = sizeOf(`public/uploads/${img.filename}`);

            console.log(`Width: ${imgOriginalDimensions.width} , Height: ${imgOriginalDimensions.height}`);

            if(imgOriginalDimensions.width < 1123 && imgOriginalDimensions.height < 796){
                res.status(400).json({message: 'The image is too small to be resized!'});
            }else if(imgOriginalDimensions.width < 796 && img.imgOriginalDimensions.height < 1123){
                res.status(400).json({message: 'The image is too small to be resized!'});
            }else{
                img.originalWidth = imgOriginalDimensions.width;
                img.originalHeight = imgOriginalDimensions.height;

                if(img.originalWidth > img.originalHeight){
                    img.orientation = 'horizontal';
                }else{
                    img.orientation = 'vertical';
                }

                if(img.orientation === 'horizontal'){
                    const resizedImg = imageAspectRatio.calculate(img.originalWidth, img.originalHeight, 1123, 796);
                    console.log(resizedImg);
                    res.status(200).json({message: 'Image dimensions calculated successfully!', orientation: img.orientation, newWidth: resizedImg.width, newHeight: resizedImg.height});
                }else{
                    const resizedImg = imageAspectRatio.calculate(img.originalWidth, img.originalHeight, 796, 1123);
                    console.log(resizedImg);
                    res.status(200).json({message: 'Image dimensions calculated successfully!', orientation: img.orientation, newWidth: resizedImg.width, newHeight: resizedImg.height});
                }
                
                console.log(req.file);
            
            }
            
        }
    })
});


app.listen(PORT, ()=>{
    console.log('Server listening on port ' + PORT);
});
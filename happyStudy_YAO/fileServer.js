var express = require('express');

var app = express( );
app.configure(function() {
    app.use(express.bodyParser({uploadDir: './'}));
});
app.listen(8800);

app.get('/upload', function(req, res) {
    res.write('<html><body><form method="post" enctype="multipart/form-data" action="/fileUpload">'
    +'<input type="file" name="uploadingFile"><br>'
    +'<input type="submit">'
    +'</form></body></html>');
    res.end();
});

var fs = require('fs');

app.post('/fileUpload', function(req, res) {

    var uploadedFile = req.files.uploadingFile;
        var tmpPath = uploadedFile.path;
        var targetPath = './file/' + uploadedFile.name;

        fs.rename(tmpPath, targetPath, function(err) {
            if (err) throw err;
               fs.unlink(tmpPath, function() {
                   
                   console.log('File Uploaded to ' + targetPath + ' - ' + uploadedFile.size + ' bytes');
            });
        });
    res.send('file upload is done.');
    res.end();
});



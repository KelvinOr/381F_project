function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        return reader.result.toString();
    }
    reader.onerror = function (error) {
        console.log('Error: ', error);
    }
}
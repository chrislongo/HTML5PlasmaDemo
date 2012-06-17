// 2012 Chris Longo (cal@chrislongo.net)

var demo = new function() 
{
    var context;
    var buffer;
    var bufferContext;
    var imageData;
    var palette;
    var width;
    var height;
    var frames = 0;
    var fpsStart = new Date();
    var start = new Date();
    var freq = 47.5;

    this.canvas = undefined;

    this.init = function()
    {
        context = canvas.getContext('2d');

        // 300x300 internal resolution
        width = canvas.width / Math.ceil(canvas.width / 300);
        height = canvas.height / Math.ceil(canvas.height / 300);

        initBuffer();

        update();
    };

    // offscreen buffer for rendering and scaling
    var initBuffer = function()
    {
        buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        buffer.style.visibility = 'hidden';
        
        bufferContext = buffer.getContext("2d");
        imageData = bufferContext.createImageData(width, height);
    };

    // main render loop
    var update = function()
    {
        render();
        draw();
        frames++;

        requestAnimFrame(function() { update(); });
    };

    var render = function()
    {
        cyclePalette();

        var time = (new Date() - start) / 100;

        for(var x = 0; x < width; x++)
        {
            for(var y = 0; y < height; y++)
            {
                var p1 = 128 + (128 * Math.sin(x / freq + time));
                var p2 = 128 + (128 * Math.sin(y / freq - time));
                var p3 = 128 + (128 * Math.sin(hypot(x, y) / freq + time));

                drawPixel(x, y, palette[~~((p1 + p2 + p3) / 3)]);
            }
        }
    };

    var cyclePalette = function()
    {
        palette = Array(256);

        var time = (new Date() - start) / 3.33;

        for(var i = 0; i < 256; i++)
        {
            var r = ~~(128 + 127 * Math.cos(i * Math.PI / 128 + time / 74));
            var g = ~~(128 + 127 * Math.sin(i * Math.PI / 128 + time / 63));
            var b = ~~(128 + 127 * Math.cos(i * Math.PI / 128 + time / 81));

            palette[i] = [r, g, b];
        }
    };

    var hypot = function(x, y)
    {
        return (Math.sqrt(x * x + y * y) || 0);
    };

    // draw colormap->palette values to screen
    var draw = function()
    {
        bufferContext.putImageData(imageData, 0, 0);
        context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
    };

    // set pixels in imageData
    var drawPixel = function(x, y, color)
    {
        var offset = (x + y * imageData.width) * 4;
        imageData.data[offset] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = 255;
    };

    this.framerate = function()
    {
        var now = new Date();
        var seconds = (now - fpsStart) / 1000;
        var rate = frames / seconds;

        fpsStart = now;
        frames = 0;

        return Math.round(rate);
    };
};

window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();
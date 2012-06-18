// 2012 Chris Longo (cal@chrislongo.net)

var demo = new function() 
{
    var context;
    var buffer;
    var bufferContext;
    var imageData1;
    var imageData2;
    var palette = Array(256);
    var width;
    var height;
    var frames = 0;
    var fpsStart = new Date();
    var start = new Date();
    var freq1 = 47.5;
    var freq2 = 33.3;
    var layers = 3;
    var cycle = 0;
    var scale = 1;
    var mod = 0.01;

    this.canvas = undefined;

    this.init = function()
    {
        this.canvas.onclick = function()
        {
            if(++layers > 3)
                layers = 1;
        };

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
        imageData1 = bufferContext.createImageData(width, height);
        imageData2 = bufferContext.createImageData(width, height);
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
        cyclePalettes();

        var t1 = (new Date() - start) / 1000;
        var t2 = (new Date() - start) / 10000;

        var f1, f2, f3;

        // render each layer on alternating frames
        for(var x = 0; x < width; x++)
        {
            for(var y = 0; y < height; y++)
            {
                if(!cycle)
                {
                    f1 = 128 + (128 * Math.sin(x / freq1 + t1));
                    f2 = 128 + (128 * Math.sin(y / freq1 - t1));
                    f3 = 128 + (128 * Math.sin(hypot(x, y) / freq1 + t1));

                    p = ~~((f1 + f2 + f3) / 3.0);

                    drawPixel(imageData1, x, y,
                        palette[p], 255);
                }
                else
                {
                    f1 = 128 + (128 * Math.sin(x / freq2 - t2));
                    f2 = 128 + (128 * Math.sin(y / freq2 + t2));
                    f3 = 128 + (128 * Math.sin(distance(x, y,
                        Math.sin(-t2) * 128 + 128, Math.cos(-t2) * 128 + 128)));

                    drawPixel(imageData2, x, y,
                        palette[~~((f1 + f2 + f3) / 3.0)], 128);
                }
            }
        }
        
        cycle = !cycle;
    };

    var cyclePalettes = function()
    {
        var r, g, b;
        var i;
        var t;

        if(!cycle)
        {
            t  = (new Date() - start) / 3.33;

            for(i = 0; i < 256; i++)
            {
                r = ~~(128 + 128 * Math.cos(i * Math.PI / 128 + t / 45.0));
                g = ~~(128 + 128 * Math.sin(i * Math.PI / 128 + t / 55.0));
                b = ~~(128 + 128 * Math.cos(i * Math.PI / 128 + t / 77.0));

                palette[i] = [r, g, b];
            }
        }
        else
        {
            t = (new Date() - start) / 2.22;
            
            for(i = 0; i < 256; i++)
            {
                r = ~~(128 + 127 * Math.sin(i * Math.PI / 128 + t / 62.0));
                g = ~~(128 + 127 * Math.cos(i * Math.PI / 128 + t / 47.0));
                b = ~~(128 + 127 * Math.sin(i * Math.PI / 128 + t / 81.0));

                palette[i] = [r, g, b];
            }
        }
    };

    var hypot = function(x, y)
    {
        return (Math.sqrt(x * x + y * y) || 0);
    };

    var distance = function(x1, y1, x2, y2)
    {
        return Math.sqrt(((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)));
    };

    // draw colormap->palette values to screen
    var draw = function()
    {
        if(layers & 0x01)
        {
            bufferContext.putImageData(imageData1, 0, 0);
            context.drawImage(buffer, 0, 0, canvas.width, canvas.height);
        }

        if(layers & 0x02)
        {
            bufferContext.putImageData(imageData2, 0, 0);
            context.drawImage(buffer, 0, 0,
                canvas.width * scale, canvas.height * scale);
            
            scale += mod;
            if(scale > 2.22 || scale < 1)
                mod = -(mod);
        }
    };

    // set pixels in imageData
    var drawPixel = function(imageData, x, y, color, alpha)
    {
        var offset = (x + y * imageData.width) * 4;
        imageData.data[offset] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = alpha;
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
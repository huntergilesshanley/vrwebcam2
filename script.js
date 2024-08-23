

var video = document.createElement('video'),
    feed = document.createElement('canvas'),
    display = document.querySelector("#leftEye"),
    rightEye = document.querySelector("#rightEye");

var displayContext = display.getContext('2d');
var rightEyeContext = rightEye.getContext('2d');
let currentEffect;

let FeedSettingsToggle = true;
let CancelStreamFeed = false;
let resize = () => {
    feed.width = window.innerWidth;
    display.width = window.innerWidth / 2;
    rightEye.width = window.innerWidth / 2;
    display.height = window.innerHeight;
    feed.height = window.innerHeight;
    rightEye.height = window.innerHeight;
    CancelStreamFeed=true;
};

window.addEventListener("resize", resize);
resize();
CancelStreamFeed = false;

document.addEventListener("click", ProcessClick);


function ProcessClick(Event) {

    if (
        !["BUTTON", "INPUT", "SELECT", "OPTION"].includes(
            Event.target.tagName
        )
    ) {
        FeedSettingsToggle = !FeedSettingsToggle;
        if (FeedSettingsToggle) {
            // Show live feed
            document.querySelector("#feed").style.display = "flex";
            document.querySelector("#settings").style.display = "none";
        } else {
            // Show settings
            document.querySelector("#settings").style.display = "flex";
            document.querySelector("#feed").style.display = "none";
        }

    };
}

function CreateSelectElement(Options) {
    let SelectElement = document.createElement("SELECT");

    Options.forEach((Option) => {
        let OptionElement = document.createElement("OPTION");
        OptionElement.innerHTML = Option.Text;
        SelectElement.appendChild(OptionElement);
    });

    SelectElement.addEventListener("change", (Event) => {
        Options[SelectElement.selectedIndex].Method();
    });

    // Options[0].Method();

    return SelectElement;
}

let CurrentDeviceId = undefined;

let CurrentFacingMode = "user";
// document.querySelector("#settings").appendChild(
//     CreateSelectElement([
//         {
//             Text: "user",
//             Method: () => {
//                 CurrentFacingMode = "user";
//                 play()
//             },
//         },
//         {
//             Text: "environment",
//             Method: () => {
//                 CurrentFacingMode = "environment";
//                 play()
//             },
//         },
//     ])
// );




function play() {
    navigator.mediaDevices.getUserMedia({
        video: {  width: { min: 360, ideal: 1280, max: 1920 },
        height: { min: 240, ideal: 720, max: 1080 }, deviceId: CurrentDeviceId, CurrentFacingMode: "user"}
    }).then((stream) => {
        onSuccess(stream);

    }).catch((error) => {
        console.log(error);
    });

}

function onSuccess(stream) {
    video.autoplay = true;

    if (video.srcObject !== undefined) {
        video.srcObject = stream;
    } else if (video.mozSrcObject !== undefined) {
        video.mozSrcObject = stream;
    } else if (window.URL.createObjectURL) {
        video.src = window.URL.createObjectURL(stream);
    } else if (window.webkitURL) {
        video.src = window.webkitURL.createObjectURL(stream);
    } else {
        video.src = stream;
    }
    //video.srcObject = stream;

    streamFeed();



}


let lastImageData = 0;

function streamFeed() {

    if(CancelStreamFeed) {
        CancelStreamFeed = false;
        play();
        return;
    }

    requestAnimationFrame(streamFeed);

    var feedContext = feed.getContext('2d');

    var imageData;

    feedContext.drawImage(video, 0, 0, window.innerWidth, display.height);
    //rightEyeContext.drawImage(video, 0, 0, window.innerWidth, display.height);
    imageData = feedContext.getImageData(0, 0, window.innerWidth, display.height);

if(lastImageData == 0) {
    lastImageData = imageData;
}

    if (typeof currentEffect !== 'undefined') {
        imageData.data.set(currentEffect.routine(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height, lastImageData.data));

    }
    displayContext.putImageData(imageData, -window.innerWidth/4, 0);
    rightEyeContext.putImageData(imageData,  -window.innerWidth/4, 0);

    lastImageData = imageData;
}














   /*
NW N NE
 W   E
SW S SE
   */






    var effects = [
      
       
        {
            name: "none", routine: data => { return data }
        },
        {
            name: "LSD", routine: (data, width, height) => {
                
                let finaldata = data;

                for (j = 0; j < data.length; j += 4) {
                   let RED = data[j];
                   let BLUE = data[j+1];
                   let GREEN = data[j+2];


               
                    RED= RED*5%255;
                    BLUE = BLUE*5%255
                   GREEN = GREEN *5%255;

                   
                    finaldata[j] = RED*5%255;
                    finaldata[j + 1] = BLUE*5%255
                    finaldata[j + 2] = GREEN *5%255;

                
                }
                return finaldata;
            }
        },
      
        {
            name: "LSLOW", routine: (data, width, height, lastdata) => {
                let finaldata = data;
                let SIZE = 5;

                let tempdata = data;
                let blurAmount = 4; 
        
 
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let ky = -blurAmount; ky <= blurAmount; ky++) {
                            for (let kx = -blurAmount; kx <= blurAmount; kx++) {
                                let ny = y + ky;
                                let nx = x + kx;
                                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                    let offset = (ny * width + nx) * 4;
                                    r += data[offset];
                                    g += data[offset + 1];
                                    b += data[offset + 2];
                                    count++;
                                }
                            }
                        }
                        let idx = (y * width + x) * 4;
                        tempdata[idx] = r / count;
                        tempdata[idx + 1] = g / count;
                        tempdata[idx + 2] = b / count;
                        tempdata[idx + 3] = data[idx + 3];
                    }
                }

                for (j = 0; j < data.length; j += 4) {

                    RED = Math.max(0, Math.min(255, Math.ceil(tempdata[j] / SIZE) * SIZE));
                    GREEN = Math.max(0, Math.min(255, Math.ceil(tempdata[j + 1] / SIZE) *SIZE));
                    BLUE= Math.max(0, Math.min(255, Math.ceil(tempdata[j + 2] / SIZE) * SIZE));

                    RED= RED*5%255;
                    BLUE = BLUE*5%255
                   GREEN = GREEN *5%255;

                   if(Math.abs(RED-lastdata[j]) > 50 || Math.abs(GREEN-lastdata[j+1]) > 50  || Math.abs(BLUE-lastdata[j+2]) > 50 ) {
                    finaldata[j] = (lastdata[j]*3+RED)/4;
                    finaldata[j + 1] = (lastdata[j+1]+GREEN)/2;
                    finaldata[j + 2] = (lastdata[j+2]+BLUE)/2;
                    continue;
                   }
                    finaldata[j] = (RED*5%255);
                    finaldata[j + 1] =  (lastdata[j+1]+(BLUE*5%255))/2
                    finaldata[j + 2] =  (lastdata[j+2]+(GREEN*5%255))/2;

                }
                return finaldata;
            }
        },
        {
            name: "LSDBLACK", routine: (data, width, height) => {
                let finaldata = data;
                for (j = 0; j < data.length; j += 4) {
                    
                   let RED = data[j];
                   let BLUE = data[j+1];
                   let GREEN = data[j+2];

                if(RED > (BLUE + GREEN) / 1.7 || GREEN > (BLUE + RED) / 1.7|| BLUE > (RED + GREEN) / 1.7) {
                    finaldata[j] = 0;
                    finaldata[j + 1] = 0;
                    finaldata[j + 2] =0;

                   continue;
                }
                RED= RED*5%255;
                BLUE = BLUE*5%255
               GREEN = GREEN *5%255;
                    finaldata[j] = RED*5%255;
                    finaldata[j + 1] = BLUE*5%255
                    finaldata[j + 2] = GREEN *5%255;

                
                }
                return finaldata;
            }
        },
        {
            name: "quantize", routine: (data, width, height) => {
                let finaldata = data;
                for (j = 0; j < data.length; j += 4) {
                    finaldata[j] = Math.max(0, Math.min(255, Math.ceil(finaldata[j] / 50) * 50));
                    finaldata[j + 1] = Math.max(0, Math.min(255, Math.ceil(finaldata[j + 1] / 50) * 50));
                    finaldata[j + 2] = Math.max(0, Math.min(255, Math.ceil(finaldata[j + 2] / 50) * 50));

                }
                return finaldata;
            }
        },
        {
            name: "grayscale", routine: (data, width, height) => {
                let finaldata = data;
                for (j = 0; j < data.length; j += 4) {
                    let gray = (0.299 * data[j] + 0.587 * data[j + 1] + 0.122 * data[j + 2]);
                    finaldata[j] = gray;
                    finaldata[j + 1] = gray;
                    finaldata[j + 2] = gray;
                }
                return finaldata;
            }
        }
        , {
            name: "invert", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    finaldata[i] = 255 - data[i];
                    finaldata[i + 1] = 255 - data[i + 1];
                    finaldata[i + 2] = 255 - data[i + 2];
                }
                return finaldata;
            }
        }
        ,
        {
            name: "sepia", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    finaldata[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    finaldata[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    finaldata[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                return finaldata;
            }
        }
        ,
        {
            name: "noise", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    let noise = Math.random() * 50 - 25;
                    finaldata[i] += noise;
                    finaldata[i + 1] += noise;
                    finaldata[i + 2] += noise;
                }
                return finaldata;
            }
        }
        ,
        {
            name: "emboss", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        let idx = (i * width + j) * 4;
                        let gray = (0.299 * data[idx]) + (0.587 * data[idx + 1]) + (0.114 * data[idx + 2]);
                        let nextIdx = ((i + 1) * width + (j + 1)) * 4;
                        let nextGray = (0.299 * data[nextIdx]) + (0.587 * data[nextIdx + 1]) + (0.114 * data[nextIdx + 2]);
                        let diff = gray - nextGray + 128;
                        finaldata[idx] = diff;
                        finaldata[idx + 1] = diff;
                        finaldata[idx + 2] = diff;
                    }
                }
                return finaldata;
            }
        },
        {
            name: "pixelate", routine: (data, width, height) => {
                let finaldata = data;
                let blockSize = 10; // adjust the block size as needed
                for (let i = 0; i < height; i += blockSize) {
                    for (let j = 0; j < width; j += blockSize) {
                        let totalR = 0, totalG = 0, totalB = 0;
                        let count = 0;
                        for (let k = 0; k < blockSize; k++) {
                            for (let l = 0; l < blockSize; l++) {
                                let x = Math.min(width - 1, j + l);
                                let y = Math.min(height - 1, i + k);
                                let idx = (y * width + x) * 4;
                                totalR += data[idx];
                                totalG += data[idx + 1];
                                totalB += data[idx + 2];
                                count++;
                            }
                        }
                        let avgR = totalR / count;
                        let avgG = totalG / count;
                        let avgB = totalB / count;
                        for (let k = 0; k < blockSize; k++) {
                            for (let l = 0; l < blockSize; l++) {
                                let x = Math.min(width - 1, j + l);
                                let y = Math.min(height - 1, i + k);
                                let idx = (y * width + x) * 4;
                                finaldata[idx] = avgR;
                                finaldata[idx + 1] = avgG;
                                finaldata[idx + 2] = avgB;
                            }
                        }
                    }
                }
                return finaldata;
            }
        },
     
       
        
        {
            name: "flipUpsideDown", routine: (data, width, height) => {
                let finaldata = new Uint8ClampedArray(data.length);
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let srcIndex = (y * width + x) * 4;
                        let destIndex = ((height - 1 - y) * width + x) * 4;
                        finaldata[destIndex] = data[srcIndex];
                        finaldata[destIndex + 1] = data[srcIndex + 1];
                        finaldata[destIndex + 2] = data[srcIndex + 2];
                        finaldata[destIndex + 3] = data[srcIndex + 3];
                    }
                }
                return finaldata;
            }
        }
        ,
        {
            name: "grayscaleExceptRed", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    if (r > g && r > b) {
                        continue; 
                    }
                    let gray = 0.3 * r + 0.59 * g + 0.11 * b;
                    finaldata[i] = gray;
                    finaldata[i + 1] = gray;
                    finaldata[i + 2] = gray;
                }
                return finaldata;
            }
        },
        {
            name: "grayscaleExceptGreen", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    if (g > r && g > b) {
                        continue; 
                    }
                    let gray = 0.3 * r + 0.59 * g + 0.11 * b;
                    finaldata[i] = gray;
                    finaldata[i + 1] = gray;
                    finaldata[i + 2] = gray;
                }
                return finaldata;
            }
        },
        {
            name: "grayscaleExceptBlue", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    if (r > g && r > b) {
                        continue; 
                    }
                    let gray = 0.3 * r + 0.59 * g + 0.11 * b;
                    finaldata[i] = gray;
                    finaldata[i + 1] = gray;
                    finaldata[i + 2] = gray;
                }
                return finaldata;
            }
        },
        
        {
            name: "badDayToBeBlue", routine: (data, width, height) => {
                let finaldata = data;
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
                    if (b > r && b > g) {
                        let gray = 0.3 * r + 0.59 * g + 0.11 * b;
                        finaldata[i] = gray;
                        finaldata[i + 1] = gray;
                        finaldata[i + 2] = gray;
                        continue; 
                    }
              
                   
                }
                return finaldata;
            }
        }
        ,
        {
            name: "saturate", routine: (data, width, height) => {
                let finaldata = data;
                let saturation =3; 
                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];
        
                    // Calculate the luminance of the pixel
                    let luminance = 0.3 * r + 0.59 * g + 0.11 * b;
        
                    // Apply saturation
                    finaldata[i] = Math.min(255, luminance + (r - luminance) * saturation);
                    finaldata[i + 1] = Math.min(255, luminance + (g - luminance) * saturation);
                    finaldata[i + 2] = Math.min(255, luminance + (b - luminance) * saturation);
                }
                return finaldata;
            }
        },
        {
            name: "bloom",
            routine: (data, width, height) => {
                let finaldata = data;
                let tempdata = data;
                let blurAmount = 2; // Adjust for stronger/weaker bloom
        
                // First pass: Apply a simple blur
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let ky = -blurAmount; ky <= blurAmount; ky++) {
                            for (let kx = -blurAmount; kx <= blurAmount; kx++) {
                                let ny = y + ky;
                                let nx = x + kx;
                                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                    let offset = (ny * width + nx) * 4;
                                    r += data[offset];
                                    g += data[offset + 1];
                                    b += data[offset + 2];
                                    count++;
                                }
                            }
                        }
                        let idx = (y * width + x) * 4;
                        tempdata[idx] = r / count;
                        tempdata[idx + 1] = g / count;
                        tempdata[idx + 2] = b / count;
                        tempdata[idx + 3] = data[idx + 3];
                    }
                }
        
                // Second pass: Combine the original and blurred image to create bloom effect
                for (let i = 0; i < data.length; i += 4) {
                    finaldata[i] = Math.min(255, data[i] + tempdata[i] * 0.5);
                    finaldata[i + 1] = Math.min(255, data[i + 1] + tempdata[i + 1] * 0.5);
                    finaldata[i + 2] = Math.min(255, data[i + 2] + tempdata[i + 2] * 0.5);
                    finaldata[i + 3] = data[i + 3];
                }
        
                return finaldata;
            }
        },
        {
            name: "sharpen", 
            routine: (data, width, height) => {
                let finaldata = new Uint8ClampedArray(data.length);
        
                // Define the sharpening kernel
                const scaleFactor = 4; // Adjust this value to increase/decrease effect
                const kernel = [
                    [ 0, -scaleFactor,  0],
                    [-scaleFactor,  (4 * scaleFactor) + 1, -scaleFactor],
                    [ 0, -scaleFactor,  0]
                ];
                const kernelSize = 3;
                const kernelHalf = Math.floor(kernelSize / 2);
        
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let r = 0, g = 0, b = 0;
        
                        for (let ky = -kernelHalf; ky <= kernelHalf; ky++) {
                            for (let kx = -kernelHalf; kx <= kernelHalf; kx++) {
                                let iy = Math.min(height - 1, Math.max(0, y + ky));
                                let ix = Math.min(width - 1, Math.max(0, x + kx));
                                let idx = (iy * width + ix) * 4;
                                let weight = kernel[ky + kernelHalf][kx + kernelHalf];
        
                                r += data[idx] * weight;
                                g += data[idx + 1] * weight;
                                b += data[idx + 2] * weight;
                            }
                        }
        
                        let newIdx = (y * width + x) * 4;
                        finaldata[newIdx] = Math.min(255, Math.max(0, r));
                        finaldata[newIdx + 1] = Math.min(255, Math.max(0, g));
                        finaldata[newIdx + 2] = Math.min(255, Math.max(0, b));
                        finaldata[newIdx + 3] = data[newIdx + 3]; // Keep alpha channel unchanged
                    }
                }
        
                return finaldata;
            }
        },
        {
            name: "chromaticAberration", routine: (data, width, height) => {
                let finaldata = data.slice(); // Copy original data
                const shift = 8; // Shift for chromatic aberration
                for (let i = 0; i < data.length; i += 4) {
                    let rIdx = i;
                    let gIdx = i + 1;
                    let bIdx = i + 2;
        
                    // Shift red channel to the left
                    if (rIdx - shift * 4 >= 0) {
                        finaldata[rIdx] = data[rIdx - shift * 4];
                    }
                    // Shift blue channel to the right
                    if (bIdx + shift * 4 < data.length) {
                        finaldata[bIdx] = data[bIdx + shift * 4];
                    }
                }
                return finaldata;
            }
        },
       
    
        {
            name: "fishEye", routine: (data, width, height) => {
                let finaldata = new Uint8ClampedArray(data.length); // Initialize new data
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(width, height) / 2;
        
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let dx = x - centerX;
                        let dy = y - centerY;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < radius) {
                            let r = distance / radius;
                            let theta = Math.atan2(dy, dx);
                            let rDistorted = radius * Math.sqrt(r);
                            let srcX = Math.floor(centerX + rDistorted * Math.cos(theta));
                            let srcY = Math.floor(centerY + rDistorted * Math.sin(theta));
                            let srcIdx = (srcY * width + srcX) * 4;
                            let dstIdx = (y * width + x) * 4;
                            finaldata[dstIdx] = data[srcIdx];
                            finaldata[dstIdx + 1] = data[srcIdx + 1];
                            finaldata[dstIdx + 2] = data[srcIdx + 2];
                            finaldata[dstIdx + 3] = data[srcIdx + 3];
                        }
                    }
                }
                return finaldata;
            }
        },
        {
            name: "duotone", routine: (data, width, height) => {
                let finaldata = data.slice(); // Copy original data
                const color1 = [63, 81, 181]; // Dark tone (Blue)
                const color2 = [255, 193, 7]; // Light tone (Yellow)
        
                for (let i = 0; i < data.length; i += 4) {
                    let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    finaldata[i] = avg < 128 ? color1[0] : color2[0];
                    finaldata[i + 1] = avg < 128 ? color1[1] : color2[1];
                    finaldata[i + 2] = avg < 128 ? color1[2] : color2[2];
                }
                return finaldata;
            }
        },
       
        {
            name: "solarize", routine: (data, width, height) => {
                let finaldata = data.slice(); // Copy original data
                for (let i = 0; i < data.length; i += 4) {
                    finaldata[i] = data[i] > 128 ? 255 - data[i] : data[i];
                    finaldata[i + 1] = data[i + 1] > 128 ? 255 - data[i + 1] : data[i + 1];
                    finaldata[i + 2] = data[i + 2] > 128 ? 255 - data[i + 2] : data[i + 2];
                }
                return finaldata;
            }
        },
  
        {
            name: "morph",
            routine: (data, width, height) => {
                let finaldata = new Uint8ClampedArray(data.length);
                let period = 20;
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let idx = (y * width + x) * 4;
                        let offsetX = Math.sin(y / period) * 10;
                        let offsetY = Math.cos(x / period) * 10;
                        
                        let newX = Math.min(Math.max(x + offsetX, 0), width - 1);
                        let newY = Math.min(Math.max(y + offsetY, 0), height - 1);
                        let newIdx = (Math.round(newY) * width + Math.round(newX)) * 4;
                        
                        finaldata[idx] = data[newIdx];
                        finaldata[idx + 1] = data[newIdx + 1];
                        finaldata[idx + 2] = data[newIdx + 2];
                        finaldata[idx + 3] = data[newIdx + 3];
                    }
                }
                
                return finaldata;
            }
        }
    
      
        
                
        
        
        
        
        




    ];

    let hueRotateFunction = (data, angle) => {
            let finaldata = data;
            let cosA = Math.cos(angle * Math.PI / 180);
            let sinA = Math.sin(angle * Math.PI / 180);
            
            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                
                finaldata[i] = Math.min(255, Math.max(0, 
                    (0.213 + cosA * 0.787 - sinA * 0.213) * r + 
                    (0.715 - cosA * 0.715 - sinA * 0.715) * g + 
                    (0.072 - cosA * 0.072 + sinA * 0.928) * b));
                finaldata[i + 1] = Math.min(255, Math.max(0, 
                    (0.213 - cosA * 0.213 + sinA * 0.143) * r + 
                    (0.715 + cosA * 0.285 + sinA * 0.140) * g + 
                    (0.072 - cosA * 0.072 - sinA * 0.283) * b));
                finaldata[i + 2] = Math.min(255, Math.max(0, 
                    (0.213 - cosA * 0.213 - sinA * 0.787) * r + 
                    (0.715 - cosA * 0.715 + sinA * 0.715) * g + 
                    (0.072 + cosA * 0.928 + sinA * 0.072) * b));
            }
            return finaldata;
        };
    
    for(i=0;i<365-365/8.111;i+=365/8.111) {
        let Angle = i;
        effects.push({name: `hueRotate${Math.round(i)}degrees`, routine: (data, width, height) => { return hueRotateFunction(data, Angle)}})
    }

    currentEffect = effects[0];

    (async () => {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        let Devices = await navigator.mediaDevices.enumerateDevices();
        document.querySelector("#settings").appendChild(
            CreateSelectElement(
                Devices.filter((Device) => Device.kind == "videoinput").map(
                    (Device) => {
                        return {
                            Text: Device.label,
                            Method: () => {
                                CurrentDeviceId = Device.deviceId;

                                CancelStreamFeed = true;
                           
                            },
                        };
                    }
                )
            )
        );
CurrentDeviceId = Devices[0].deviceId;
      
        
        document.querySelector("#settings").appendChild(
            CreateSelectElement(
                effects.map(Effect => {
                    return {Text: Effect.name, Method: () => {
                        currentEffect = Effect;
                    }}
                })
            )
        );

        video.style.display = 'none';
        feed.style.display = 'none';
    
    CancelStreamFeed = true;
        play();
        
    
    })();

    
 
  

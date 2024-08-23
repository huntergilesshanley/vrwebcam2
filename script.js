
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
    display.width = window.innerWidth;
    rightEye.width = window.innerWidth;
    display.height = window.innerHeight;
    feed.height = window.innerHeight;
    rightEye.height = window.innerHeight;
};

document.addEventListener("resize", resize);
resize();

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
        video: { width: window.innerWidth, height: window.innerHeight, deviceId: CurrentDeviceId, CurrentFacingMode: "user"}
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



function streamFeed() {

    if(CancelStreamFeed) {
        CancelStreamFeed = false;
        play();
        return;
    }

    requestAnimationFrame(streamFeed);

    var feedContext = feed.getContext('2d');

    var imageData;

    feedContext.drawImage(video, 0, 0, display.width, display.height);
    imageData = feedContext.getImageData(0, 0, display.width, display.height);


    if (typeof currentEffect !== 'undefined') {
        imageData.data.set(currentEffect.routine(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height));

    }
    displayContext.putImageData(imageData, 0, 0);
    rightEyeContext.putImageData(imageData, 0, 0);
}














   






    var effects = [
        {
            name: "none", routine: data => { return data }
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
            name: "hueRotate", 
            routine: (data, width, height, angle = 90) => {
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
        }
        
        
        
        




    ];

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

    
 
  

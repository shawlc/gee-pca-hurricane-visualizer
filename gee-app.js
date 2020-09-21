var panel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {width: '400px'}
});

var label = ui.Label('Principle Component Analysis is an exploratory technique that allows for the analysis of multi-dimensional data.');
panel.add(label);

var label = ui.Label('This app calculates and visualizes the principle components of global ocean/atmospheric satellite images to identify major weather events.');
panel.add(label);

var precipVis = {
  min: 1.0,
  max: 9.0,
  palette: ["white","green","blue"],
  opacity:0.4
};

var sstVis = {
  min: 1.0,
  max: 9.0,
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
};

var windVis = {
  min: 0.0,
  max: 9.0,
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
};

var visParams = sstVis;
var imageKey = "NOAA CDR Sea Surface Temperature"
var imageColl = sstData;
var bandProperty = "sst";
var dataset = {
  "NOAA CDR Sea Surface Temperature": [sstData,"sst",sstVis],
  "NOAA CDR Wind Speed": [oceanData,"wind_speed",windVis],
  "NASA PMM Global Precipitation": [precipitationData,"precipitationCal",precipVis],
};
var selectData = ui.Select({
  items: Object.keys(dataset),
  onChange: function(key) {
    imageKey = key;
    imageColl = dataset[key][0];
    bandProperty = dataset[key][1];
    visParams = dataset[key][2];
  }
});
selectData.setPlaceholder('Choose a Satellite Imagery Dataset');
panel.add(selectData);

var button = ui.Button({
  label: 'Continue',
  onClick: function() {
   
panel.clear()	

var label = ui.Label(imageKey);
panel.add(label);

var label = ui.Label('Choose an oceanic region and date range to be analyzed.');
panel.add(label);


var places = {
  "North Atlantic Ocean": North_Atlantic,
  "East Pacific Ocean": East_Pacific,
  "West Pacific Ocean": West_Pacific,
  "North Indian Ocean": North_Indian,
  "South Indian and Pacific Oceans":South_Indian_Pacific,
  "All Oceans":All_Oceans
};

var region = North_Atlantic;

var select = ui.Select({
  items: Object.keys(places),
  onChange: function(key) {
    region = places[key];
    var zoom = 0;
    if (key != "All Oceans"){Map.centerObject(places[key], 3)}
    else {Map.centerObject(Center, 2)} 
  }
});

// Set a place holder.
select.setPlaceholder('Choose an oceanic region');

panel.add(select);

var label = ui.Label('Input date range in Year-Month-Day format e.g. (2017-09-1). Check Earth Engine Data Catalog for specific Date Availability');
panel.add(label);

var startString = "2017-09-16";
var endString = "2017-10-2";
var dateRegex = /^\d{4}-\d{2}-\d{1,2}$/;

var starttext = ui.Textbox({
  placeholder: 'Enter start date ... ',
  onChange: function(text) {
    startString = text;
    if(startString.match(dateRegex)===null){alert("Please input a valid date")}
  }
});
panel.add(starttext);

var endtext = ui.Textbox({
  placeholder: 'Enter end date ... ',
  onChange: function(text) {
    endString = text;
    if(startString.match(dateRegex)===null){alert("Please input a valid date")}
  }
});
panel.add(endtext);

var label = ui.Label('Regions and Date Ranges for Preset Tropical Cyclones can be selected below');
panel.add(label);

var presets = {
  "No Preset": null,
  "Hurricane Maria": [North_Atlantic,"2017-09-16","2017-10-2"],
  "Hurricane Patricia": [East_Pacific,"2015-10-20","2015-10-24"],
  "Tropical Cyclone Pam": [South_Indian_Pacific,"2015-03-6","2015-03-22"],
  "Tropical Cyclone Chapala": [North_Indian,"2015-10-28","2015-11-4"],
  "Typhoon Meranti":[West_Pacific,"2016-09-8","2016-09-17"]
};

var selectPreset = ui.Select({
  items: Object.keys(presets),
  onChange: function(key) {
    if(presets[key] !== null){
    region = presets[key][0];
    startString = presets[key][1];
    endString = presets[key][2];
    Map.centerObject(presets[key][0], 3);
  }}
});
selectPreset.setPlaceholder('Choose a preset cyclone if no inputs made above');
panel.add(selectPreset);



//This is an image collection of 3 hour data for global precipitation
var dayArray = [];
//Let's constrain our mapped images to representative daily data.
var startyear = startString.slice(0,4);
var startmonth = startString.slice(5,7);
var startday = Number(startString.slice(8));
//These parameters can be tweaked for any start day. The months are given with leading zeroes
//i.e. April is "0" + 4 whereas November is just 11
var endyear = endString.slice(0,4);
var endmonth = endString.slice(5,7);
var endday = Number(endString.slice(8));
//I have chosen start and end dates for Hurricane Maria 
for (var i = startday; i<30;i++){
  var startDate = startyear + "-" + startmonth + "-" + i;
  var endDate = startyear + "-" + startmonth + "-" + (i+1);
  dayArray.push(imageColl.filter(ee.Filter.date(startDate.toString(), endDate.toString())).median());
  if(i === 29){
    startmonth ++;
    i = 0;
    if(startmonth == 13){
      startmonth = 1;
    }
  }
  if(startmonth == 2 && i === 27){
    i = 0;
    startmonth++;
  }
  if(i == endday && startmonth == endmonth){
    i = 30;
  }
}


var label = ui.Label('Enter number of Principle Components');
panel.add(label);

var pcNum = 2;
var PCtext = ui.Textbox({
  placeholder: 'Default = 2',
  onChange: function(num) {
    pcNum = num;
    if(num > dayArray.length){alert("Input exceeds maximum PCs")}
  }
});
panel.add(PCtext);


var startButton = ui.Button({
  label: 'Calculate PCA',
  onClick: function() {

Map.clear();

//This for loop adds to the array Date filters for the median of 3 hr data for each day from the 
//specified start and end times
var compositeColl = ee.ImageCollection(dayArray);

var globprecip = compositeColl.select(bandProperty);
var regionFeature = ee.Feature(region);
var precipitation = globprecip.map(function(img){return img.clip(regionFeature)});
//I am constraining the selected bands to just precipitation data, mapped in a drawn
//geometry containing North America and the North Atlantic Ocean

Map.addLayer(precipitation.sum(), visParams,"Sum of Satellite Images");



var empty = ee.Image();
var image = ee.Image(precipitation.iterate(function(img, previous) {
  return ee.Image(previous).addBands(img);
}, empty));
image = image.select(image.bandNames().remove('constant'));
//I convert my time series image collection into a single multi-band image with each band representing
//a day in the time series. This code was inspired by the following StackOverflow post:
//https://stackoverflow.com/questions/50069059/google-earth-engine-flatten-a-one-band-imagecollection-into-a-multi-band-single


//The following code was copied from GEE's tutorial on Eigen Analysis. I annotated each step
//to explain each mathematical step in PCA acheived from each line of code.

/**
 * Compute the Principal Components
 */

//NOTE - All the bands of the image are selected

// Set some information about the input to be used later.
var bandNames = image.bandNames();
var scale = 30000;
// Mean center the data to enable a faster covariance reducer
// and an SD stretch of the principal components.
var meanDict = image.reduceRegion({
//NOTE - reduceRegion = Zonal Statistics! This applies the reducer on every pixel in the region
    reducer: ee.Reducer.mean(),
//NOTE - We are setting each pixel to the mean of all pixels in the region
    geometry: region,
    scale: scale,
    maxPixels: 1e9
});
//NOTE - meanDict is a dictionary! Remember that reducers create dictionaries, not images

var means = ee.Image.constant(meanDict.values(bandNames));
//NOTE - constant creates a new image where every pixel = the value of our meanDict
var centered = image.subtract(means);
//NOTE - our new image = the difference from the mean!

// This helper function returns a list of new band names.
var getNewBandNames = function(prefix) {
  var seq = ee.List.sequence(1, bandNames.length());
//NOTE - seq is just a list of numbers from 1 to the number of bands
  return seq.map(function(b) {
    return ee.String(prefix).cat(ee.Number(b).int());
//NOTE - THIS WILL BE USED TO RENAME OUR BANDS TO PC1 - PCN
  });
};

// This function accepts mean centered imagery, a scale and
// a region in which to perform the analysis.  It returns the
// Principal Components (PC) in the region as a new image.
var getPrincipalComponents = function(centered, scale, region) {
  // Collapse the bands of the image into a 1D array per pixel.
  var arrays = centered.toArray();

//NOTE - THIS IS A MISNOMER! arrays is itself an image where each pixel has the value of an array
//NOTE - arrays is mathematically equal to centered, we are just preparing it for covariance
//NOTE - Each array contains the values of each band within the image! It essentially combines each band into a single map

  // Compute the covariance of the bands within the region.
  var covar = arrays.reduceRegion({
    reducer: ee.Reducer.centeredCovariance(),
//NOTE - centeredCovariance specifically calculates a covariance matrix from each 1D pixel array
//NOTE - centeredCovariance can only be used for mean centered data!
//NOTE - It converts 1D arrays of N length to a NxN covariance matrix
//NOTE - If I have 5 bands, then each array has 5 elements. My covariance matrix is 5x5.
//NOTE - The eigendecomposition of my covariance matrix will provide 5 eigenvectors/principle components

//NOTE - Notice that even though are data is 4D (multiple spatial bands), we are using a  
//NOTE - 2D covariance matrix to produce 1D eigenvectors
    geometry: region,
    scale: scale,
    maxPixels: 1e9
  });

//NOTE - Remember reduceRegion produces a Dictionary, just like every other Reducer!

  // Get the 'array' covariance result and cast to an array.
  // This represents the band-to-band covariance within the region.
  var covarArray = ee.Array(covar.get('array'));
//NOTE - We can convert the dictionary into an actual covariance matrix array

  // Perform an eigen analysis and slice apart the values and vectors.
  var eigens = covarArray.eigen();

//NOTE - This convenient function gives us all the eigenvectors and eigenvalues
//NOTE - The first value in each row is the eigenvalue
//NOTE - Every subsequent value in each row make up the corresponding eigenvector

  // This is a P-length vector of Eigenvalues.
  var eigenValues = eigens.slice(1, 0, 1);
//NOTE - ee.Array.slice allows for 3D capability
//NOTE - Here we slice along axis 1 (COLUMNS) from index (0,1). 
//NOTE - This isolates the first value in each row i.e. the eigen values

  // This is a PxP matrix with eigenvectors in rows.
  var eigenVectors = eigens.slice(1, 1);
//NOTE - Slice along axis 1 from index (1,end)


  // Convert the array image to 2D arrays for matrix computations.
  var arrayImage = arrays.toArray(1);

//NOTE - I'm not exactly sure what is going on here
//NOTE - From documentation, toArray(N) on a N dimensional pixel array image will result in an 
//NOTE - N+1 dimensional pixel array image. It does what we need, but the console output
//NOTE - Doesn't show that arrayImage has any more dimensions than the original arrays image

  // Left multiply the image array by the matrix of eigenvectors.
  var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);
//NOTE - I think this is essentially just setting the values of each pixel of our arrayImage
//NOTE - to the matrices of the eigenvectors. The matrix of eigenvectors should already equal
//NOTE - our P loading matrix.


  // Turn the square roots of the Eigenvalues into a P-band image.
  var sdImage = ee.Image(eigenValues.sqrt())
    .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);
//NOTE - eigenvalues is a 1D P-length vector of eigenvalues
//NOTE - arrayFlatten will create new bands with scalars equal to each value in the corresponding eigenvalue
//NOTE - This essentially converts a single band with multidimensional pixel values
//NOTE - Into an image with multiple bands of scalar pixel values

//NOTE - I am not sure exactly what role arrayProject does here, since flatten should reduce 
//NOTE - dimensionality. It likely prepares the vector of eigenvalues for flattening

  // Turn the PCs into a P-band image, normalized by SD.
  return principalComponents
    // Throw out an an unneeded dimension, [[]] -> [].
    .arrayProject([0])
//NOTE - This gives some inference as to what arrayProject does. Making a multidimenional pixel
//NOTE - value image likely introduces another dimension to pixel values. We'll need to reduce 
//NOTE - that extra unnecessary dimension

    // Make the one band array image a multi-band image, [] -> image.
    .arrayFlatten([getNewBandNames('pc')])
//NOTE - getNewBandNames just renames our bands to pc1, pc2, etc.
//NOTE - DIMENSION REDUCTION - The flattening is a bit trickier here. We are essentially creating 
//NOTE - a band for each eigenvector, for which each pixel value is equal to a 2D eigenvector.
//NOTE - The axis specified in arrayProject likely makes it so we know to reduce the P loading
//NOTE - matrix by each eigenvector, and not along them.
    // Normalize the PCs by their SDs.
    .divide(sdImage);
//NOTE - Both my PC and my sdImage have the same number of bands
//NOTE - because I have the same number of eigenvalues as eigenvectors!
};

// Get the PCs at the specified scale and in the specified region
var pcImage = getPrincipalComponents(centered, scale, region);



// Plot each PC as a new layer
for (var i = 0; i < pcNum; i++) {
  var band = pcImage.bandNames().get(i).getInfo();
  Map.addLayer(pcImage.select([band]), visParams, band);
}


  }
});
panel.add(startButton);



var label = ui.Label('Region and date range default to those of Hurricane Maria with no inputs. PCA may take some time to process depending on the region size and date range.');
panel.add(label);

  }
});
panel.add(button);

ui.root.add(panel);

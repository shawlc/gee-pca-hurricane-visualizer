# Google Earth Engine Principle Component Analysis Hurricane Visualizer

This is the very first app I made in October 2018, using Google Earth Engine's online Javascript codng platform. 

This application leverages Google Earth Engine's vast global imagery datasets and cloud processing to perform principle component analysis on global weather imagery across variable time intervals. It serves as a demonstration on how principle component analysis can be used in GEE and on remote sensing data. 

The proposed usage of this application is to potentially identify where hurricanes have occurred in the past. By calculating principle components on global precipitation, wind speed, and temperature datasets within particular seasons, one can see where hurricanes and other tropical storms have resulted in huge spatiotemporal variance in these metrics. 

This application can be viewed at https://leoshaw.users.earthengine.app/view/pca-hurricane-visualizer

This code can be directly deployed through the Google Earth Engine browser IDE. 

The code uses the GEE API for eigenvector analysis and data transformations. I include my interpretation on each of the functions performed in the comments.

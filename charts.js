function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    var metadata = data.metadata;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample);

    //gauge array
    var metaArray = metadata.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    var result = resultArray[0];

    // variable for first sample in metadata array
    var metaResult = metaArray[0];
    console.log(metaResult)
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var belly_otu_ids = result.otu_ids;
    var belly_otu_labels = result.otu_labels;
    var belly_sample_values =result.sample_values;
    // console.log(belly_sample_values)

    // variable to hold the washing frequency

    var belly_washing_freq = metaResult.wfreq;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var yticks = belly_otu_ids.map(row=> "OTU " + row).slice(0,10).reverse();
    var xvals = belly_sample_values.slice(0,10).reverse();
    var textdata = belly_otu_labels.slice(0,10).reverse(); 

    console.log(yticks)
    // 8. Create the trace for the bar chart. 
    var trace = {
      x: xvals,
      y: yticks,
      type: "bar",
      orientation: "h",
      text: textdata,
      hovertemplate: textdata
    };

    var barData = [trace]
    // 9. Create the layout for the bar chart. 
    var barLayout = {
     title: {text:"<b>Top 10 Bacterial Cultures</b>", font:{size:22}},
     xaxis: {title:"Number of Bacteria"},
     yaxis: {title: ""},
     width:400,
     height:500,
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar",barData,barLayout)

    // Bar and Bubble charts
    // 1. Create the trace for the bubble chart.
    function createRGB(belly_otu_ids) {
      var otuColor = [];
      for (i=0;i<belly_otu_ids.length; i++) {
        var rgb = "rgb";
          if (belly_otu_ids[i]<500) {rgb = rgb + '(12,117,66)';}
          else if (belly_otu_ids[i]<1000) {rgb = rgb + '(26,196,114)';}
          else if (belly_otu_ids[i]<1500) {rgb = rgb + '(39,16,61)';}
          else if (belly_otu_ids[i]<2000) {rgb = rgb + '(117,61,1)';}
          else if (belly_otu_ids[i]<3000) {rgb = rgb + '(189,105,15)';}
          else {rgb = rgb + '(245,167,83)'}
          otuColor.push(rgb);
      }
      return otuColor;
    }
    
    
    
    var bubbleTrace = {
      x: belly_otu_ids,
      y: belly_sample_values,
      mode: 'markers',
      text: textdata,
      marker: {
        size: belly_sample_values,
        color: createRGB(belly_otu_ids)},
      text: belly_otu_labels,
      hovertemplate: belly_otu_labels
    };

    var bubbleDate = [bubbleTrace]
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: {text:"<b>Bacteria Cultures per Sample</b>",font:{size:20}},
      xaxis: {text:"OTU ID", font:{size:22}},
      yaxis: {text:""},
      showlegend: false,
      height:500,
      width:988
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble",bubbleDate,bubbleLayout);
    
    // Gauge Chart
        
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: { x: [0, 1], y: [0, 1] },
      value: belly_washing_freq,
      title: {text:"<b>Belly Button Washing Frequency</b><br>Scrubs per Week",font:{size:18}},
      type:"indicator",
      mode:"gauge+number",
      gauge: {
        axis:{range: [null,10], dtick:2, tickwidth: 1, tickcolor:"black"},
        bar:{color:"black"},
        steps:[
          {range:[0,2], color:"red"},
          {range:[2,4], color:"darkorange"},
          {range:[4,6], color:"yellow"},
          {range:[6,8], color:"springgreen"},
          {range:[8,10], color:"green"},
        ]

      }
    }
     
    ];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      width:500,
      height:500,
      margin: {t:0, b:0}

    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge",gaugeData,gaugeLayout);

  });
}
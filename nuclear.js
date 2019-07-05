const map_width = 825,
  map_height = 550;

let active = d3.select(null);

const side_container_panel = document.querySelector(".side-container"),
  side_panel = document.querySelector("#side_panel"),
  drag_button = document.querySelector("#side_drag_button");

const projection = d3.geo.albersUsa()
  .scale(1000)
  .translate([map_width / 2, map_height / 2]);

const path = d3.geo.path()
  .projection(projection);

const map_svg = d3.select(".us-map").append("svg")
  .attr("class", "map_svg")
  .attr("viewBox", "0 0 " + map_width + " " + map_height)
  .attr("preserveAspectRatio", "xMinYMin");

map_svg.append("rect")
  .attr("class", "map_background")
  .on("click", reset);

const states = map_svg.append("g")
  .style("stroke-width", "1.5px");

let state;

let state_text_group;

let state_name_text;

let state_num_group;

let state_num_circle;

let state_num_text;

let states_mesh;

let state_name_line;

let region1_label, region2_label, region3_label, region4_label;

let region_sites, region_group;

let sites;

let site_points;

let site_labels_group;

let site_labels;

let site_labels_text;

let site_array = [],
  sites_array = [],
  site_name_array = [],
  state_number_unit_array = [];

let region_1;

const region_font_size = ".5em",
  region_circle_radius = 8;

const cb_array = document.querySelectorAll("input[type=checkbox]");

const region1_ids = ["09", "10", "23", "24", "25", "33", "34", "36", "42", "44", "50"],
  region2_ids = ["01", "12", "13", "21", "37", "45", "47", "51", "54", "72", "78"],
  region3_ids = ["17", "18", "19", "26", "27", "29", "39", "55"],
  region4_ids = ["02", "04", "05", "06", "08", "15", "16", "20", "22", "28", "30", "31", "32", "35", "38", "40", "41", "46", "48", "49", "53", "56"],
  hq_ids = ["11"];

d3.queue()
  .defer(d3.json, "us.json")
  .defer(d3.json, "id_to_state.json")
  .defer(d3.csv, "data/operating_reactors.csv")
  .defer(d3.csv, "data/construction_reactors.csv")
  .defer(d3.csv, "data/fuel_facilities.csv")
  .defer(d3.csv, "data/decommissioned.csv")
  .defer(d3.csv, "data/research_test_reactors.csv")
  .defer(d3.csv, "data/nrc_location.csv")
  .await(buildViz);

function buildViz(error, us, id_to_state, operating, construction, fuel_facilities, decommissioned, research, nrc) {

  if (error) throw error;

  drag_button.innerHTML = "<";

  drag_button.addEventListener("click", () => {

    side_container_panel.classList.toggle("expanded");

    if (side_container_panel.classList.contains("expanded")) {
      drag_button.innerHTML = ">";

    } else {
      drag_button.innerHTML = "<";
    }

  });

  cb_array.forEach((check) => {
    check.addEventListener("change", () => {
      updateSitesDisplayArrays();
      drawMapUpdate();
    })
  });

  operating.forEach(function (d) {
    d.unit = +d["Unit"];
    d.status = "Operating";

    if (d["Plant_Name"] != null) {
      d.plant_name = d["Plant_Name"];
      var strNameSplit = d["Plant_Name"].split(",");
      d.site = strNameSplit[0];
    }

    d.location = d["Location"];

    if (d.location != null) {
      var strSplit = d.location.split(",");
      d.lat = +strSplit[0];
      d.long = +strSplit[1];
    } else {
      d.lat = +"0.0";
      d.long = +"0.0";
    }

    d.state = d["State"];

    d.state_id = id_to_state.filter(function (x) {
      return x.STUSAB === d.state;
    })[0].STATE.toString();
    d.region = d["Region"];
    d.url = d["NRC_Webpage"];
    d.wiki = d["Wikipedia_URL"];
    site_array.push(d);

    var item_to_push = {
      site: d.site,
      long: d.long,
      lat: d.lat,
      type: d.status,
      url: d.url,
      state_id: d.state_id.toString()
    };

    sites_array.push(item_to_push);

  });

  construction.forEach(function (d) {
    d.unit = +d["Unit"];
    d.status = "Construction";

    if (d["Plant_Name"] != null) {
      d.plant_name = d["Plant_Name"];
      var strNameSplit = d["Plant_Name"].split(",");
      d.site = strNameSplit[0];
    }

    d.location = d["Location"];

    if (d.location != null) {
      var strSplit = d.location.split(",");
      d.lat = +strSplit[0];
      d.long = +strSplit[1];
    } else {
      d.lat = +"0.0";
      d.long = +"0.0";
    }

    d.state = d["State"];

    d.state_id = id_to_state.filter(function (x) {
      return x.STUSAB === d.state;
    })[0].STATE.toString();
    d.region = d["Region"];
    d.url = d["NRC_Webpage"];
    d.wiki = d["Wikipedia_URL"];
    site_array.push(d);

    var item_to_push = {
      site: d.site,
      long: d.long,
      lat: d.lat,
      type: d.status,
      url: d.url,
      state_id: d.state_id.toString()
    };

    sites_array.push(item_to_push);

  });

  fuel_facilities.forEach(function (d) {
    d.status = "Fuel Facility";

    if (d["Plant Name"] != null) {
      d.plant_name = d["Plant Name"];
      d.site = d["Plant Name"];
    }

    d.location = d["Location"];

    if (d.location != null) {
      var strSplit = d.location.split(",");
      d.lat = +strSplit[0];
      d.long = +strSplit[1];
    } else {
      d.lat = +"0.0";
      d.long = +"0.0";
    }

    d.city_state = d["City State"];
    d.state = d.city_state.slice(d.city_state.length - 2);
    d.state_id = id_to_state.filter(function (x) {
      return x.STUSAB === d.state;
    })[0].STATE.toString();
    d.region = d["Region"];
    d.url = d["NRC_Webpage"];
    site_array.push(d);

    var item_to_push = {
      site: d.site,
      long: d.long,
      lat: d.lat,
      type: d.status,
      url: d.url,
      state_id: d.state_id.toString()
    };

    sites_array.push(item_to_push);

  });

  decommissioned.forEach(function (d) {

    d.unit = +d["Unit"];
    d.status = "Decommissioned";

    if (d["Plant_Name"] != null) {
      d.plant_name = d["Plant_Name"];
      var strNameSplit = d["Plant_Name"].split(",");
      d.site = strNameSplit[0];
    }

    d.location = d["Location"];

    if (d.location != null) {
      var strSplit = d.location.split(",");
      d.lat = +strSplit[0];
      d.long = +strSplit[1];
    } else {
      d.lat = +"0.0";
      d.long = +"0.0";
    }

    d.city_state = d["City State"];
    d.state = d.city_state.slice(d.city_state.length - 2);
    d.state_id = id_to_state.filter(function (x) {
      return x.STUSAB === d.state;
    })[0].STATE.toString();
    d.region = d["Region"];
    d.url = d["NRC_Webpage"];
    d.wiki = d["Wikipedia_URL"];
    site_array.push(d);

    var item_to_push = {
      site: d.site,
      long: d.long,
      lat: d.lat,
      type: d.status,
      state_id: d.state_id.toString()
    };

    sites_array.push(item_to_push);

  });

  research.forEach(function (d) {
    d.unit = +d["Unit"];
    d.status = "Research";

    if (d["Licensee"] != null) {
      d.plant_name = d["Licensee"];
      d.site = d["Licensee"];
    }

    d.location = d["Location"];

    if (d.location != null) {
      var strSplit = d.location.split(",");
      d.lat = +strSplit[0];
      d.long = +strSplit[1];
    } else {
      d.lat = +"0.0";
      d.long = +"0.0";
    }

    d.city_state = d["City State"];
    d.state = d.city_state.slice(d.city_state.length - 2);
    d.state_id = id_to_state.filter(function (x) {
      return x.STUSAB === d.state;
    })[0].STATE.toString();
    d.region = d["Region"];
    d.url = d["NRC_Webpage"];
    d.rx_type = d["Reactor Type"];

    site_array.push(d);

    var item_to_push = {
      site: d.site,
      long: d.long,
      lat: d.lat,
      type: d.status,
      url: d.url,
      state_id: d.state_id.toString()
    };

    sites_array.push(item_to_push);

  });

  nrc.forEach(function (d) {
    d.region = d["Name"];
    d.region_abbr = d["Name"].replace('egion ', '');
    d.site = d["Name"];
    d.location = d["Location"];

    if (d.location != null) {
      var strSplit = d.location.split(",");
      d.lat = +strSplit[0];
      d.long = +strSplit[1];
    } else {
      d.lat = +"0.0";
      d.long = +"0.0";
    }

    d.city_state = d["City State"].split(",");
    if (d.city_state.length == 1) {
      d.city = d.city_state[0];
      d.state = "DC";
    } else {
      d.city = d.city_state[0];
      d.state = d.city_state[1].trim();
    }

    d.state_id = id_to_state.filter(function (x) {
      return x.STUSAB === d.state;
    })[0].STATE.toString();
    d.url = d["Website"];

  })

  sites_array.sort(function (a, b) {
    let x = a.site - b.site;
    return x == 0 ? a.type - b.type : x;
  });

  updateSitesDisplayArrays();

  state = states.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", function (d) {
      const state_id_num = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();
      const class_to_return = "state ";
      if (region1_ids.indexOf(state_id_num) != -1) {
        return class_to_return + "region1";
      } else if (region2_ids.indexOf(state_id_num) != -1) {
        return class_to_return + "region2";
      } else if (region3_ids.indexOf(state_id_num) != -1) {
        return class_to_return + "region3";
      } else if (region4_ids.indexOf(state_id_num) != -1) {
        return class_to_return + "region4";
      } else if (hq_ids.indexOf(state_id_num) != -1) {
        return class_to_return + "hq"
      }
    })
    .attr("id", function (d) {
      const state_id_num = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();

      return state_id_num;

    })
    .on("click", clicked);

  states_mesh = states.append("path")
    .datum(topojson.mesh(us, us.objects.states, function (a, b) {
      return a !== b;
    }))
    .attr("class", "mesh")
    .attr("d", path);

  region1_label = map_svg
    .append("text")
    .attr("class", "region_label")
    .attr("id", "region1_label")
    .text("Region 1")
    .attr("transform", "translate(630, 60)");

  region2_label = map_svg
    .append("text")
    .attr("class", "region_label")
    .attr("id", "region2_label")
    .text("Region 2")
    .attr("transform", "translate(680, 370)");

  region3_label = map_svg
    .append("text")
    .attr("class", "region_label")
    .attr("id", "region3_label")
    .text("Region 3")
    .attr("transform", "translate(450, 60)");

  region4_label = map_svg
    .append("text")
    .attr("class", "region_label")
    .attr("id", "region4_label")
    .text("Region 4")
    .attr("transform", "translate(240, 60)");

  state_text_group = states.selectAll(".state_text_group")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("g")
    .attr("transform", function (d) {
      let x = y = 0;

      switch (d.id) {
        case 6: //CA
          x = path.centroid(d)[0] - 15;
          y = path.centroid(d)[1] + 5;
          break;
        case 9: //CT
          x = path.centroid(d)[0] + 55;
          y = path.centroid(d)[1] + 22;
          break;
        case 10: //DE
          x = path.centroid(d)[0] + 35;
          y = path.centroid(d)[1] + 5;
          break;
        case 11: //DC
          x = path.centroid(d)[0] + 55;
          y = path.centroid(d)[1] + 32;
          break;
        case 12: //FL
          x = path.centroid(d)[0];
          y = path.centroid(d)[1];
          break;
        case 15: //HI
          x = path.centroid(d)[0] - 20;
          y = path.centroid(d)[1] + 20;
          break;
        case 16: //ID
          x = path.centroid(d)[0];
          y = path.centroid(d)[1] + 20;
          break;
        case 22: //LA
          x = path.centroid(d)[0];
          y = path.centroid(d)[1] + 15;
          break;
        case 24: //MD
          x = path.centroid(d)[0] + 52;
          y = path.centroid(d)[1] + 19;
          break;
        case 25: //MA
          x = path.centroid(d)[0] + 49;
          y = path.centroid(d)[1];
          break;
        case 26: //WI
          x = path.centroid(d)[0] + 10;
          y = path.centroid(d)[1] + 15;
          break;
        case 27: //MN
          x = path.centroid(d)[0] - 10;
          y = path.centroid(d)[1];
          break;
        case 28: //MS
          x = path.centroid(d)[0] - 10;
          y = path.centroid(d)[1];
          break;
        case 33: //NH
          x = path.centroid(d)[0] + 52;
          y = path.centroid(d)[1] + 5;
          break;
        case 34: //NJ
          x = path.centroid(d)[0] + 27;
          y = path.centroid(d)[1] + 10;
          break;
        case 44: //RI
          x = path.centroid(d)[0] + 40;
          y = path.centroid(d)[1] + 10;
          break;
        case 47: //TN
          x = path.centroid(d)[0];
          y = path.centroid(d)[1];
          break;
        case 50: //VT
          x = path.centroid(d)[0] - 10;
          y = path.centroid(d)[1] - 25;
          break;
        case 54: //WV
          x = path.centroid(d)[0] - 1;
          y = path.centroid(d)[1] + 5;
          break;
        case 55: //WI
          x = path.centroid(d)[0] - 10;
          y = path.centroid(d)[1];
          break;
        case 60: //AS

        case 66: //GU

        case 69: //MP

        case 72: //PR

        case 74: //UM

        case 78: //VI
          x = 0;
          y = 0;
          break;

        case 1: //AL

        case 2: //AK

        case 4: //AZ

        case 5: //AR

        case 8: //CO

        case 13: //GA

        case 17: //IL

        case 18: //IN

        case 19: //IA

        case 20: //KS

        case 21: //KY

        case 23: //ME

        case 29: //MO

        case 30: //MT

        case 31: //NE

        case 32: //NV

        case 35: //NM

        case 36: //NY

        case 37: //NC

        case 38: //ND

        case 39: //OH

        case 40: //OK

        case 41: //OR

        case 42: //PA

        case 45: //SC

        case 46: //SD

        case 48: //TX

        case 49: //UT

        case 51: //VA

        case 53: //WA

        case 56: //WY

        default:
          x = path.centroid(d)[0];
          y = path.centroid(d)[1];
          break;
      }
      return `translate(${x}, ${y})`;
    })

  state_name_text = state_text_group
    .append("text")
    .text(function (d) {
      const state_id_str = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();
      let unit_text_display = "";

      if (id_to_state.map(function (x) {
          return x.STATE;
        }).indexOf(state_id_str) > -1) {
        unit_text_display = id_to_state.filter(x => x.STATE === state_id_str)[0].STUSAB;
      }

      return unit_text_display;
    })
    .attr("class", "state_name_txt")
    .attr("text-anchor", "middle")
    .attr("font-size", '.8em')
    .attr("fill", "black")
    .attr("font-weight", "800")
    .attr("pointer-events", "normal")
    .attr("cursor", "pointer")
    .on("click", clicked);

  state_num_group = state_text_group
    .append("g")
    .attr("transform", "translate(20, 0)")
    .attr("text-anchor", "middle")
    .attr("cursor", "pointer")
    .on("click", clicked);

  state_num_circle = state_num_group
    .append("circle")
    .attr("r", 8)
    .attr("cy", -4.5)
    .attr("fill", function (d) {
      const state_id_str = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();

      if (state_number_unit_array.map(function (x) {
          return x.state_id;
        }).indexOf(state_id_str) > -1) {
        return "orange";
      } else {
        return "none";
      }
    });

  state_num_text = state_num_group
    .append("text")
    .text(function (d) {
      const state_id_str = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();
      let unit_text_display = "";

      if (state_number_unit_array.map(function (x) {
          return x.state_id;
        }).indexOf(state_id_str) > -1) {
        unit_text_display = state_number_unit_array.filter(x => x.state_id === state_id_str)[0].unit_num;
      }

      return unit_text_display;
    })
    .attr("class", "state_num_txt")
    .attr("fill", "black")
    .attr("font-size", '.8em')
    .attr("fill", "black")
    .attr("font-weight", "800")
    .attr("pointer-events", "normal");

  state_name_line = state_text_group
    .append("line")
    .attr("class", "state_name_line")
    .attr("pointer-events", "none")
    .attr("x1", function (d) {
      switch (d.id) {
        case 60: //AS

        case 66: //GU

        case 69: //MP

        case 72: //PR

        case 74: //UM

        case 78: //VI
          return 0;
          break;

        case 9: //CT

        case 10: //DE

        case 11: //DC

        case 24: //MD

        case 25: //MA

        case 33: //NH

        case 34: //NJ

        case 44: //RI
          return -12;
          break;

        case 50: //VT

        case 1: //AL

        case 2: //AK

        case 4: //AZ

        case 5: //AR

        case 6: //CA

        case 8: //CO

        case 12: //FL

        case 13: //GA

        case 15: //HI

        case 16: //ID

        case 17: //IL

        case 18: //IN

        case 19: //IA

        case 20: //KS

        case 21: //KY

        case 22: //LA

        case 23: //ME

        case 26: //WI

        case 27: //MN

        case 28: //MS

        case 29: //MO

        case 30: //MT

        case 31: //NE

        case 32: //NV

        case 35: //NM

        case 36: //NY

        case 37: //NC

        case 38: //ND

        case 39: //OH

        case 40: //OK

        case 41: //OR

        case 42: //PA

        case 45: //SC

        case 46: //SD

        case 47: //TN

        case 48: //TX

        case 49: //UT

        case 51: //VA

        case 53: //WA

        case 54: //WV

        case 55: //WI

        case 56: //WY

        default:
          return 0;
          break;
      }
    })
    .attr("y1", function (d) {
      switch (d.id) {
        case 60: //AS

        case 66: //GU

        case 69: //MP

        case 72: //PR

        case 74: //UM

        case 78: //VI
          return 0;
          break;

        case 9: //CT

        case 10: //DE

        case 11: //DC

        case 24: //MD

        case 25: //MA

        case 33: //NH

        case 34: //NJ

        case 44: //RI
          return -5;
          break;

        case 50: //VT

        case 1: //AL

        case 2: //AK

        case 4: //AZ

        case 5: //AR

        case 6: //CA

        case 8: //CO

        case 12: //FL

        case 13: //GA

        case 15: //HI

        case 16: //ID

        case 17: //IL

        case 18: //IN

        case 19: //IA

        case 20: //KS

        case 21: //KY

        case 22: //LA

        case 23: //ME

        case 26: //WI

        case 27: //MN

        case 28: //MS

        case 29: //MO

        case 30: //MT

        case 31: //NE

        case 32: //NV

        case 35: //NM

        case 36: //NY

        case 37: //NC

        case 38: //ND

        case 39: //OH

        case 40: //OK

        case 41: //OR

        case 42: //PA

        case 45: //SC

        case 46: //SD

        case 47: //TN

        case 48: //TX

        case 49: //UT

        case 51: //VA

        case 53: //WA

        case 54: //WV

        case 55: //WI

        case 56: //WY

        default:
          return 0;
          break;
      }
    })
    .attr("x2", function (d) {
      const text_x = d3.transform(d3.select(this.parentNode).attr("transform")).translate[0];

      switch (d.id) {
        case 60: //AS

        case 66: //GU

        case 69: //MP

        case 72: //PR

        case 74: //UM

        case 78: //VI
          return 0;
          break;

        case 9: //CT

        case 10: //DE

        case 11: //DC

        case 12: //FL

        case 15: //HI

        case 16: //ID

        case 22: //LA

        case 24: //MD

        case 25: //MA

        case 26: //WI

        case 33: //NH

        case 34: //NJ

        case 44: //RI

        case 47: //TN

        case 50: //VT

        case 54: //WV

        case 1: //AL

        case 2: //AK

        case 4: //AZ

        case 5: //AR

        case 6: //CA

        case 8: //CO

        case 13: //GA

        case 17: //IL

        case 18: //IN

        case 19: //IA

        case 20: //KS

        case 21: //KY

        case 23: //ME

        case 27: //MN

        case 28: //MS

        case 29: //MO

        case 30: //MT

        case 31: //NE

        case 32: //NV

        case 35: //NM

        case 36: //NY

        case 37: //NC

        case 38: //ND

        case 39: //OH

        case 40: //OK

        case 41: //OR

        case 42: //PA

        case 45: //SC

        case 46: //SD

        case 48: //TX

        case 49: //UT

        case 51: //VA

        case 53: //WA

        case 55: //WI

        case 56: //WY

        default:
          return path.centroid(d)[0] - text_x;
          break;
      }
    })
    .attr("y2", function (d) {
      const text_y = d3.transform(d3.select(this.parentNode).attr("transform")).translate[1];

      switch (d.id) {
        case 60: //AS

        case 66: //GU

        case 69: //MP

        case 72: //PR

        case 74: //UM

        case 78: //VI
          return 0;
          break;

        case 9: //CT

        case 10: //DE

        case 11: //DC

        case 12: //FL

        case 15: //HI

        case 16: //ID

        case 22: //LA

        case 24: //MD

        case 25: //MA

        case 26: //WI

        case 33: //NH

        case 34: //NJ

        case 44: //RI

        case 47: //TN

        case 50: //VT

        case 54: //WV

        case 1: //AL

        case 2: //AK

        case 4: //AZ

        case 5: //AR

        case 6: //CA

        case 8: //CO

        case 13: //GA

        case 17: //IL

        case 18: //IN

        case 19: //IA

        case 20: //KS

        case 21: //KY

        case 23: //ME

        case 27: //MN

        case 28: //MS

        case 29: //MO

        case 30: //MT

        case 31: //NE

        case 32: //NV

        case 35: //NM

        case 36: //NY

        case 37: //NC

        case 38: //ND

        case 39: //OH

        case 40: //OK

        case 41: //OR

        case 42: //PA

        case 45: //SC

        case 46: //SD

        case 48: //TX

        case 49: //UT

        case 51: //VA

        case 53: //WA

        case 55: //WI

        case 56: //WY

        default:
          return path.centroid(d)[1] - text_y;
          break;
      }
    })
    .style("stroke-width", function (d) {

      switch (d.id) {
        case 9: //CT

        case 10: //DE

        case 11: //DC

        case 24: //MD

        case 25: //MA

        case 33: //NH

        case 34: //NJ

        case 44: //RI

        case 50: //VT
          return "1";
          break;

        default:
          return "0";
          break;
      }
    })
    .style("stroke", "black")
    .style("stroke-linecap", "round");

  region_sites = map_svg.selectAll(".region_sites")
    .data(nrc).enter()
    .append("g")
    .attr("class", "region_sites")
    .attr("transform", function (d) {

      const str_to_proj = projection([d.long, d.lat]);
      let x = str_to_proj[0],
        y = str_to_proj[1];

      if (d.region == "HQ") {
        const dc_select = d3.transform(state_text_group.filter((x) => x.id == "11").attr("transform")).translate;
        const dc_num_select = d3.transform(state_num_group.filter((x) => x.id == "11").attr("transform")).translate;

        if (state_num_group.filter((x) => x.id == "11").selectAll("circle").attr("fill") !== "none") {
          dc_num_select[0] = dc_num_select[0] * 2;
        }

        x = dc_select[0] + dc_num_select[0];
        y = dc_select[1] + dc_num_select[1];

      }

      return `translate(${x}, ${y})`;
    });

  region_group = region_sites.append("g")
    .attr("class", "region_group")
    .attr("opacity", 1);

  region_dot = region_group
    .append("image")
    .attr("width", 18)
    .attr("height", 18)
    .attr("y", -12.5)
    .attr("x", -9)
    .attr("xlink:href", function (d) {
      if (d.region === "HQ") {
        return "img/HQ.png";
      } else {
        return "img/region.png";
      }
    })
    .attr("opacity", 1)
    .attr("pointer-events", "normal")
    .on("click", function (d) {

      side_container_panel.classList.toggle("expanded", true);
      side_panel.src = d.url;
      drag_button.innerHTML = ">";

    });

  region_text = region_group
    .append("text")
    .text(function (d) {
      return d.region_abbr;
    })
    .attr("class", "region_group_txt")
    .attr("text-anchor", "middle")
    .attr("font-size", region_font_size)
    .attr("fill", "black")
    .attr("font-weight", "800")
    .attr("pointer-events", "normal")
    .attr("cursor", "pointer");

  sites = map_svg.selectAll(".sites")
    .data(site_name_array).enter()
    .append("g")
    .attr("class", "sites")
    .attr("transform", function (d) {
      const str_to_proj = projection([d.long, d.lat]);
      let x = str_to_proj[0],
        y = str_to_proj[1];
      switch (d.site) {
        case "Salem Nuclear Generating Station":
          x = str_to_proj[0] - 1.5;
          y = str_to_proj[1] - 2.5;
          break;
        case "Hope Creek Generating Station":
          x = str_to_proj[0] - 1.5;
          y = str_to_proj[1] - 4.5;
          break;
        case "Quad Cities Nuclear Power Station":
          x = str_to_proj[0];
          break;
        case "Fermi":
          x = str_to_proj[0] - 5;
          break;
        case "Perry Nuclear Power Plant":
          y = str_to_proj[1] - 2;
          break;
        case "South Texas Project":
          y = str_to_proj[1] - 5;
          break;
        case "Honeywell":
          y = str_to_proj[1] - 4;
          break;
        case "Dresden Nuclear Power Station":
          y = str_to_proj[1] - 3;
          break;
        case "Braidwood Station":
          y = str_to_proj[1] - 1;
          break;
        case "St. Lucie Plant":
          x = str_to_proj[0] - 3;
          break;
        case "Turkey Point Nuclear Generating Station":
          x = str_to_proj[0] - 3;
          break;
        case "Beaver Valley Power Station":
          x = str_to_proj[0] - 1;
          break;
        case "Nine Mile Point Nuclear Station":
          x = str_to_proj[0] - 2;
          y = str_to_proj[1] - 2;
          break;
        case "James A. FitzPatrick Nuclear Power Plant":
          x = str_to_proj[0] + 2;
          y = str_to_proj[1] + 1;
          break;
        case "Point Beach Nuclear Plant":
          x = str_to_proj[0] - 3;
          break;
        default:
          x = str_to_proj[0] - 2.5;
          y = str_to_proj[1] - 2.5;
          break;
      }
      return `translate(${x}, ${y})`;
    });

  site_points = sites
    .append("g")
    .attr("class", "site_points")
    .attr("transform", function (d) {

      const str_to_proj = d3.transform(d3.select(this.parentNode).attr("transform")).translate;
      return `translate(${str_to_proj})`;
    })
    .attr("opacity", function (d) {
      if (d.type === "Region") {
        return 1;
      } else {
        return 0;
      }
    });


  site_points_img = site_points
    .append("image")
    .attr("width", 100)
    .attr("height", 100)
    .attr("xlink:href", function (d) {
      switch (d.type) {
        case "Construction":
          return "img/construction.png";
          break;
        case "Decommissioned":
          return "img/decommissioned.png";
          break;
        case "Fuel Facility":
          return "img/fuel_facility.png";
          break;
        case "Research":
          return "img/research.png";
          break;
        case "Operating":
          return "img/operating.png";
          break;
        default:
          return "img/tmp.png";
          break;
      }
    })
    .attr("pointer-events", "none")
    .on("click", function (d) {

      side_container_panel.classList.toggle("expanded", true);
      side_panel.src = d.url;
      drag_button.innerHTML = ">";

    });

  site_labels_group = site_points
    .append("g")
    .attr("class", "site_labels_group")
    .attr("pointer-events", "none");

  site_label = site_labels_group
    .append("rect")
    .attr("class", "site_labels")
    .attr("fill", "white")
    .attr("width", 0)
    .attr("height", 0)
    .attr("stroke", "black");

  site_label_text = site_labels_group
    .append("text")
    .attr("class", "site_label_txt")
    .attr("fill", "black")
    .attr("font-weight", "800");

};

//UTILITY FUNCTIONS

function updateSitesDisplayArrays() {

  state_number_unit_array = [],
    site_name_array = [];

  const filtered_sites = sites_array.filter((x) => {

    let found = false;
    cb_array.forEach((y) => {

      if ((y.id === x.type) && (y.checked)) found = true;

    });
    return found;
  });

  filtered_sites.forEach(function (d, i) {
    let obj_to_add = {};

    const index_to_find = state_number_unit_array.map(function (x) {
      return x.state_id;
    }).indexOf(d.state_id);

    if (index_to_find == -1) {

      obj_to_add = {
        state_id: d.state_id,
        unit_num: 1
      }

      state_number_unit_array.push(obj_to_add);

    } else {
      state_number_unit_array[index_to_find].unit_num = state_number_unit_array[index_to_find].unit_num + 1;
    }

  });

  state_number_unit_array.sort((a, b) => {

    return a.state_id - b.state_id;
  });

  filtered_sites.filter((item) => {

    const indices = site_name_array.reduce((result, current, index) => {
      if (current.site === item.site) {
        result.push(index);
      }
      return result;
    }, []);

    if (indices.length === 0) {
      site_name_array.push(item);
    } else {
      let diff_type = true;

      indices.forEach((index) => {
        if (site_name_array[index].type === item.type) {
          diff_type = false;
        }
      })

      if (diff_type) {
        site_name_array.push(item);
      }
    }
  });

  site_name_array.sort(function (a, b) {
    return (a.site > b.site) ? 1 : ((b.site > a.site) ? -1 : 0);
  });

};

function drawMapUpdate() {

  state_num_circle
    .transition().duration(250)
    .attr("fill", function (d) {
      const state_id_str = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();

      if (state_number_unit_array.length > 0) {
        if (state_number_unit_array.map(function (x) {
            return x.state_id;
          }).indexOf(state_id_str) > -1) {
          return "orange";
        } else {
          return "none";
        }
      } else {
        return "none";
      }

    });

  state_num_text.transition().duration(250)
    .text(function (d) {
      const state_id_str = d.id.toString().length == 1 ? `0${d.id.toString()}` : d.id.toString();
      let unit_text_display = "";

      if (state_number_unit_array.length > 0) {
        if (state_number_unit_array.map(function (x) {
            return x.state_id;
          }).indexOf(state_id_str) > -1) {
          unit_text_display = state_number_unit_array.filter(x => x.state_id === state_id_str)[0].unit_num;
        }
      }
      return unit_text_display;
    });

  if (active.node() != null) {

    const active_id = active[0][0].__data__.id.toString().length == 1 ? `0${active[0][0].__data__.id.toString()}` : active[0][0].__data__.id.toString();
    site_points.filter(function (d) {
        let is_not_type = false;

        cb_array.forEach((type) => {

          if ((d.type === type.id) && (!type.checked)) {
            is_not_type = true;
          }
        })
        return ((d.state_id === active_id) && (is_not_type));
      })
      .transition()
      .duration(250)
      .attr("opacity", 0)
      .attr("pointer-events", "none");

    site_points.filter(function (d) {
        let is_type = false;

        cb_array.forEach((type) => {

          if ((d.type === type.id) && (type.checked)) {
            is_type = true;
          }
        })
        return ((d.state_id === active_id) && (is_type));
      })
      .transition()
      .duration(250)
      .attr("opacity", 1)
      .attr("pointer-events", "normal");

    site_labels_group
      .transition()
      .delay(250)
      .duration(250)
      .attr("opacity", 1);

    region_sites.filter(x => x.state_id === active_id)
      .attr("opacity", 1)
      .attr("pointer-events", "normal");

  }

};

function clicked(d) {

  const active_click = d3.select(this);

  if (active_click[0][0].classList.contains("active")) return reset();

  active = state.filter(x => x.id === active_click[0][0].__data__.id);
  active.classed("active", true);
  const active_id = active[0][0].__data__.id.toString().length == 1 ? `0${active[0][0].__data__.id.toString()}` : active[0][0].__data__.id.toString();

  const bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale = .9 / Math.max(dx / map_width, dy / map_height),
    translate = [map_width / 2 - scale * x, map_height / 2 - scale * y],
    site_img_height = site_img_width = 25 / scale,
    site_label_border_width = 1 / scale,
    site_label_text_size = 10 / scale;

  state_text_group.transition()
    .duration(250)
    .attr("opacity", 0)
    .attr("pointer-events", "none");

  states_mesh.filter(function (d) {
      return (d.id !== active_id);
    }).transition()
    .duration(750).attr("opacity", 0);

  states.transition()
    .duration(750)
    .attr("transform", `translate(${translate})scale(${scale})`);

  d3.selectAll(".region_label").transition().duration(250).attr("opacity", 0);

  //if DC is selected update HQ location to its actual map location
  if (active_id === "11") {
    region_sites.filter(x => x.region === "HQ")
      .attr("transform", function (d) {

        const str_to_proj = projection([d.long, d.lat]);
        let x = str_to_proj[0],
          y = str_to_proj[1];

        return `translate(${x}, ${y})`;

      })
  }

  region_sites
    .attr("opacity", 0)
    .transition()
    .duration(750)
    .attr("transform", `translate(${translate})scale(${scale})`);

  region_dot
    .transition()
    .duration(750)
    .attr("transform", function (d) {
      var t = d3.transform(d3.select(this.parentNode.parentNode).attr("transform")).translate;
      return "translate(" + t[0] + "," + t[1] + ")scale(" + 1 / scale + ")";
    });

  region_text
    .attr("text-anchor", "start")
    .attr("vertical-align", "top")
    .attr("dy", function (d) {
      return 0;
    })
    .attr("dx", 10)
    .transition().duration(750)
    .text(function (d) {
      return d.region
    })
    .attr("transform", function (d) {
      var t = d3.transform(d3.select(this.parentNode.parentNode).attr("transform")).translate;
      return "translate(" + t[0] + "," + t[1] + ")scale(" + 1 / scale + ")";
    });

  sites.transition()
    .duration(750)
    .attr("transform", `translate(${translate})scale(${scale})`)
    .attr("opacity", 1);

  //for nicer transition of sites after zooming into state
  setTimeout((x) => {
    drawMapUpdate();
  }, 750);

  site_points_img
    .attr("height", site_img_height)
    .attr("width", site_img_width)
    .attr("pointer-events", "normal");

  site_labels_group.filter(function (d) {
      return d.state_id === active_id;
    })
    .attr("transform", function (d) {
      const g_x = 0;
      const g_y = site_label_border_width + site_img_height + site_label_text_size;
      return `translate(${g_x},${g_y})`;
    });

  site_label_text
    .attr("font-size", site_label_text_size)
    .text(function (d) {
      return d.site;
    })
    .attr("dy", function (d) {

      return 0;

    })
    .attr("dx", function (d) {

      const text_length = d3.select(this).node().getComputedTextLength();
      return -((text_length - (2 * site_label_text_size)) / 2);

    });

  state
    .filter(x => x.id !== parseInt(active_id))
    .attr("pointer-events", "none")
    .transition().duration(750)
    .attr("opacity", 0);

}

function reset() {

  side_panel.src = "";

  side_container_panel.classList.toggle("expanded", false);

  states
    .attr("pointer-events", "none")
    .transition()
    .delay(750)
    .duration(750)
    .attr("transform", "")
    .attr("opacity", 1)
    .each("end", function () {
      d3.select(this).attr("pointer-events", "normal");

    });

  region_dot.attr("transform", "scale(1)");

  region_sites
    .attr("opacity", 0)
    .transition()
    .delay(1000)
    .duration(750)
    .attr("transform", function (d) {

      const str_to_proj = projection([d.long, d.lat]);
      let x = str_to_proj[0],
        y = str_to_proj[1];

      if (d.region == "HQ") {
        const dc_select = d3.transform(state_text_group.filter((x) => x.id == "11").attr("transform")).translate;
        const dc_num_select = d3.transform(state_num_group.filter((x) => x.id == "11").attr("transform")).translate;

        if (state_num_group.filter((x) => x.id == "11").selectAll("circle").attr("fill") !== "none") {
          dc_num_select[0] = dc_num_select[0] * 2;
        }

        x = dc_select[0] + dc_num_select[0];
        y = dc_select[1] + dc_num_select[1];

      }

      return `translate(${x}, ${y})`;
    })
    .each("end", function () {
      d3.select(this).attr("opacity", 1);
    });

  region_text
    .attr("text-anchor", "middle")
    .attr("transform", "scale(1)")
    .text(function (d) {
      return d.region_abbr;
    })
    .attr("dx", 0);

  sites.transition()
    .delay(750)
    .duration(750)
    .attr("transform", "");

  site_points.transition()
    .delay(500)
    .duration(250).attr("opacity", 0);

  site_labels_group.transition()
    .duration(250)
    .attr("opacity", 0);

  site_points_img
    .attr("pointer-events", "none");

  active.classed("active", false);
  active = d3.select(null);

  states_mesh.transition()
    .delay(750)
    .duration(750)
    .attr("opacity", 1);

  state.transition()
    .delay(750)
    .duration(750)
    .attr("opacity", 1)
    .attr("pointer-events", "cursor");

  state_text_group.transition()
    .delay(1500)
    .duration(250)
    .attr("opacity", 1)
    .attr("pointer-events", "normal");

  d3.selectAll(".region_label").transition().delay(1500).duration(250).attr("opacity", 1);

}
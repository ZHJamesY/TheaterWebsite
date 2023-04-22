//MOVIE_ID = 'the movie id'
//API_KEY = 'YOUR API KEY'
//'http://www.omdbapi.com/?i=' + 'MOVIE_ID' + '&apikey=' + 'API_KEY'

let promise = new Promise(function(resolve, reject) {
    fetch("showtimes.json") //showtimes.json
        .then((resp) => resp.json())
        .then(function(data) { 
            // success
            console.log("json data: \n");
            console.log(data);
            resolve(data);
        })
        .catch(function(error) 
        { 
            // error
            reject(error);
            console.log(error);
        });
});

$(function(){
    promise.then(function(data) {
        
        // location dropdown menu
        locationDropdown();

        // location dropdown items
        locationElement(data);

        // location dropdown items clicked
        locationClick();

        // generate search contents
        searchContent(data);

        // click movie name show more info, unhidden right column content
        clickInfoDetail(data);


        //createElements(data);
    });
});

let previousMovie = "";
function clickInfoDetail(data)
{
    document.addEventListener("click", function(event) {
        // console.log("Clicked on:", event.target);
        if(event.target.classList.contains("search_table_th"))
        {
            let movie = event.target.textContent;
            previousMovie = movie;
            let movieObj = {}
            for(element of data)
            {
                if(element.title == movie)
                {
                    movieObj = element;
                    break;
                }
            }

            // getting api key from environment variable, fetch movie data
            $.get('/api', function(data) {
                fetch("http://www.omdbapi.com/?i=" + movieObj.id + "&apikey=" + data)
                .then((resp) => resp.json())
                .then(function(resp) { 
                    // success
                    console.log("Clicked movie: \n");
                    console.log(resp);
                    createElements(resp);

                    if($("#movie").attr("class") != undefined || $("#movie").attr("class") != "")
                    {
                        $("#movie").removeClass($("#movie").attr("class"))
                    }
                })
                .catch(function(error) 
                { 
                    // error
                    console.log(error);
                });
            });
        }
      });
      

}

function searchContent(data)
{
    let list = extractLocation(data,'obj');
    let resultList = [];
    $("#search_button").click(function(){

        console.log($("#movie").attr("class"));
        // hide right column content
        if($("#movie").attr("class") == "")
        {
            $("#movie").addClass("hidden");
        }

        // remove previous table
        let removeTable = document.getElementById("search_table");
        if (removeTable) 
        {
            removeTable.remove();
        }

        // get value from location and date
        let location = $("#location_dropdown_text").html();
        let date = $("#date_calendar").val().replace(/-/g, "/");

        // display movie info when location and date is not empty
        if(location != "" && date != "")
        {
            for(element of list)
            {
                if(Object.keys(element)[0] == location)
                {
                    resultList = (element);
                }
            }

            let search_content_table = document.getElementById("search_content");

            // generate table
            let table = document.createElement("table");
            table.id = "search_table"
            search_content_table.insertAdjacentElement("afterend", table);

            let tr = document.createElement("tr");


            // loop through movies
            for(element of resultList[Object.keys(resultList)[0]])
            {
                if(date == element.date)
                {
                    // loop through times
                    for(let i = 0; i < element.times.length; i++)
                    {
                        // set tr
                        let tr = document.createElement("tr");
                        tr.classList.add("search_table_tr");
                        table.appendChild(tr);
        
                        // set movie title
                        let th = document.createElement("th");
                        tr.appendChild(th);

                        // set empty title
                        if(i == 0)
                        {
                            th.innerHTML = element.title;
                            th.classList.add("search_table_th");
                        }
                        else
                        {
                            th.innerHTML = "";
                        }

                        // set time values
                        let td = document.createElement("td");
                        td.classList.add("search_table_td");
                        td.innerHTML = element.times[i];
                        tr.appendChild(td);

                        // set border line
                        if(i == element.times.length - 1)
                        {
                            th.style.borderBottom = "1px solid black";
                            td.style.borderBottom = "1px solid black";
                            td.style.paddingBottom = "10px";
                        }
                    }
                }
            }
        }
    });
}

// dropdown toggle is-active class
function locationDropdown()
{
    // Check for click events on the navbar burger icon
    $(".dropdown").click(function() {

        // Toggle the "is-active" class
        $(".dropdown").toggleClass("is-active");
    });

    // Click event handler for document
    $(document).click(function(event) {
        // Check if the clicked element is not part of the dropdown
        if (!$(event.target).closest(".dropdown").length) {
            // Remove the "is-active" class from the dropdown
            $(".dropdown").removeClass("is-active");
        }
    });

}

// dropdown text update when location clicked
function locationClick()
{
    $("#dropdown_content").click(function(event){
        $("#location_dropdown_text").html(event.target.textContent);

    });
}

// generate location dropdown items
function locationElement(data)
{
    let list = extractLocation(data, "dict");
    let dropdown = document.getElementById("dropdown_content");
    for(element of list)
    {
        let p = document.createElement("p");
        p.classList.add("dropdown-item");
        p.innerHTML = element.location;
        dropdown.appendChild(p);
    }
}

// extract cinema location from data, type = dict gets locationDict, type = obj gets locationObjs
function extractLocation(data, type)
{
    // collection of all Cinema location
    let locationDict = [];

    // list of exist location
    let checkLocation = [];

    let locationObjs = [];

    for(row of data)
    {
        let dict = {'location': ""};

        // if collection is empty, add location to locationDict
        if(locationDict.length == 0)
        {
            // add to locationDict
            dict = {'location': row.location};
            locationDict.push(dict);
            checkLocation.push(row.location);           
        }
        // else if location not exist in checkLocation, add location to locationDict
        else if(!checkLocation.includes(row.location))
        {
            // add to locationDict
            dict = {'location': row.location};
            locationDict.push(dict);
            checkLocation.push(row.location);
        }

        // check if location exist in locationObj
        let locationExist = false;
        let index = -1;
        for(element in locationObjs)
        {

            if(Object.keys(locationObjs[element])[0] == row.location)
            {
                index = element;
                locationExist = true;
                break;
            }
        }

        // if location exist push object to corresponding key
        if(locationExist == true && index != -1)
        {
            locationObjs[element][row.location].push(row);
        }
        // else add new key and value to locationObjs
        else
        {
            dict = {[row.location]: [row]};
            locationObjs.push(dict);
        }

    }

    if(type == "dict")
    {
        return locationDict;
    }
    return locationObjs;
}


// generate right column content data
function createElements(data)
{
    // get movie div
    let div = document.getElementById("movie");

    // get img tag + attributes
    let img = div.querySelector("img");
    img.src = data.Poster;
    img.alt = data.Poster;

    // get title tag, set data
    let title = document.getElementById("Title_input");
    title.value = data.Title;
    
    // get year tag, set data
    let year = document.getElementById("Year_input");
    year.value = data.Year;

    // get genre tag, set data
    let genre = document.getElementById("Genre_input");
    genre.value = data.Genre;

    // get runtime tag, set data
    let runtime = document.getElementById("Runtime_input");
    runtime.value = data.Runtime;

    // get director tag, set data
    let director = document.getElementById("Director_input");
    director.value = data.Director;

    // get writer tag, set data
    let writer = document.getElementById("Writer_input");
    writer.value = data.Writer;

    // get plot tag, set data
    let actors = document.getElementById("Actors_input");
    actors.value = data.Actors;

    // get plot tag, set data
    let plot = document.getElementById("Plot_input");
    plot.value = data.Plot;

    // get rating, get rating div tag, append number of images by rating
    let rating = data.Ratings[0].Value;
    rating = Math.ceil(parseFloat(rating.substring(0, rating.indexOf("/"))));
    let rating_div = document.getElementById("Rating_input");
    rating_div.innerHTML = "";

    for (let i = 0; i < rating; i++) {      
        let img_rating = new Image();
        img_rating.src = "./images/trophy.png";
        img_rating.width = 35;
        rating_div.append(img_rating);
    }
    
}

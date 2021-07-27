import React, { useState, useRef, useEffect, useCallback } from "react"
import { withRouter, Redirect } from "react-router";
import debounce from "lodash.debounce"
import "./edit_itinerary.css"
import { Helmet } from 'react-helmet'
import { useParams } from "react-router-dom"
import clsx from 'clsx'
import itineraryAPI from "../../services/itinerary"
import attractionsAPI from "../../services/attractions"
import FullCalendar, { parseClassNames } from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import GoogleMapReact from 'google-map-react'
import { alpha, makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia';
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Switch from '@material-ui/core/Switch'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import { green } from '@material-ui/core/colors'
import Alert from "sweetalert2"
import SaveIcon from '@material-ui/icons/Save'
import CheckIcon from '@material-ui/icons/Check'
import DeleteIcon from '@material-ui/icons/Delete'
import Rating from '@material-ui/lab/Rating'
import { positions } from '@material-ui/system';





// accessibility props  
function a11yProps(index) {
    return {
        id: `day-${index + 1}-selector`,
        'aria-controls': `day-${index + 1}-selector`,
    };
}


  

function Itinerary(props) {
    
    // <<<<<States>>>>>

    // Current Itinearry
    const [itinerary, setItinerary] = useState()
    

    // Attractions
    const [attractions, setAttractions] = useState()

    // Current day selected to edit itinerary
    const [daySelection, setDaySelection] = useState(0);

    // Save button state
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    //Google Maps
    const [maps, setMaps] = useState(
        {
            center: {
                lat: 59.95,
                lng: 30.33
              },
              zoom: 11 
        }
    )

  
    // <<<<< Effects >>>>>

    // Retrieve itinerary data
    const itineraryId = useParams().id
    
    useEffect(() => {
        try {
            getItinerary(itineraryId)
        } catch (err) {
            console.log(err)
            
        }
       
 
       
    },[])

    // Retrieve attractions based on destination
     
    // useEffect(() => {
    //     if(itinerary) {
    //         getAttractions(itinerary.location)
    //     }
    //    else console.log("invalid")       
    //  },[])
    
    // Add draggable function to attractions
    useEffect(() => {
        let draggableEl = document.getElementById("external-events");

            new Draggable(draggableEl, {
                itemSelector: ".fc-event",
                eventData: function (eventEl) {
                    let title = eventEl.getAttribute("title");
                    let id = eventEl.getAttribute("data");
                    return {
                    title: title,
                    id: id, 
                    };
                }
            });
        
        
    }, [])

    // Autosave changes to trip itinerary whenever state changes
    // Lodash function to save object to database but set delay
    const debouncedSave = useCallback(
        debounce(async (itinerary) => {
          await updateItinerary(itineraryId, itinerary.name, itinerary.destination, Number(itinerary.trip_duration), itinerary.itinerary, itinerary.published);
        }, 1000),
        [],
      );
      
      // Runs only when Itinerary changes.
      useEffect(() => {
        if (itinerary) {
          debouncedSave(itinerary);
        }
        // debouncedSave is wrapped in a useCallback with an empty dependency list,
        // thus it will not change and in turn will not re-trigger this effect.
      }, [itinerary, debouncedSave]);

    // Autosave button timer
      React.useEffect(() => {
        return () => {
          clearTimeout(timer.current);
        };
      }, []);
    
    // <<<<< Functions >>>>>

    // Function to retrieve itinerary by id and retrieve attractions based on itinerary location

    const getItinerary = async (id) => {
        let subjectItinerary
        let attractionsData
        try {
            subjectItinerary = await itineraryAPI.getItinerary(id)
            setItinerary(subjectItinerary.data)
        
        }
        catch (error) {
            console.log(error)
        }
        try {
            attractionsData = await attractionsAPI.search(subjectItinerary.data.latlong)
            
        }
        catch (error) {
            console.log(error)
        }
        console.log(attractionsData.data.attractions)
        setAttractions(attractionsData.data.attractions)
    }

  
    // Function to update itinerary by id

    const updateItinerary = async (id, name, destination, trip_duration, itinerary, published) => {
        setSuccess(false);
        setLoading(true);
        try {
            await itineraryAPI.updateItinerary(id, name, destination, trip_duration, itinerary, published)
        }
        catch (error) {
            console.log(error)
        }
        timer.current = window.setTimeout(() => {
            setLoading(false);
            setSuccess(true);
  
        }, 1000);
          timer.current = window.setTimeout(() => {
            setSuccess(false);
  
        }, 2000);
    }

    const deleteItinerary = async (id) => {
        setSuccess(false);
        setLoading(true);
        try {
            await itineraryAPI.deleteItinerary(id)
        }
        catch (error) {
            console.log(error)
        }
        timer.current = window.setTimeout(() => {
            setLoading(false);
            setSuccess(true);
  
        }, 1000);
          timer.current = window.setTimeout(() => {
            setSuccess(false);
  
        }, 2000);
    }

         
    // Function to handle save button click
    const handleSaveButtonClick =  () => {
        updateItinerary(itineraryId, itinerary.name, itinerary.destination, Number(itinerary.trip_duration), itinerary.itinerary, itinerary.published)
    }

    // Function to handle delete button click
    const handleDeleteButtonClick =  () => {
        Alert.fire({
            title: `Delete ${itinerary.name}?`,
            icon: 'warning',
            text:'Are you sure you want to delete this trip?',
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete Trip",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.value) {
                deleteItinerary(itineraryId) 
                Alert.fire("Deleted!", "Your trip has been deleted.", "success");
                props.history.push("/");
            }
        });
    }
        

    // Function to handle clicking on event in agenda
    const eventClick = (eventClick) => {
        Alert.fire({
            title: eventClick.event.title,
            html:
            `<div class="table-responsive">
                <table class="table">
                    <tbody>
                        <tr >
                            <td>Title</td>
                            <td><strong>` +
                                eventClick.event.title +
                            `</strong></td>
                        </tr>
                        <tr >
                            <td>Start Time</td>
                            <td><strong>
                                ` +
                                eventClick.event.start +
                                `
                            </strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>`,

            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Remove Event",
            cancelButtonText: "Close"
        }).then((result) => {
            if (result.value) {
                eventClick.event.remove(); // It will remove event from the calendar
                Alert.fire("Deleted!", "Your Event has been deleted.", "success");
            }
        });
    };
    


    // Function to save events to state whenever events are added/changed in itinerary
    const eventChange = (events) => {
        // let calendarApi = calendarRef.current.getApi()
        // let events = calendarApi.getEvents()
        console.log(events)
        let setEvents = events.map((event) =>({
            "title": event.title,
            "start": event.startStr,
            "end": event.endStr
        }))
            
        console.log(setEvents)
        setItinerary(prevState => ({
            ...prevState,
            itinerary: setEvents}))
    }

    // Create presistent variable
    const calendarRef = useRef(null)

    // Function to handle change in day selector foritinerary agenda
    const handleChange = (event, newValue) => {
    setDaySelection(newValue);
    let calendarApi = calendarRef.current.getApi()
    if (newValue < 9){
        calendarApi.gotoDate(`2050-01-0${newValue + 1}`)
    }
    else if (newValue < 30 && newValue > 8) {
        calendarApi.gotoDate(`2050-01-${newValue + 1}`)
    }
    
    };



    // <<<<< STYLES >>>>>

    const useStyles = makeStyles((theme) => ({
        root: {
     
            //   backgroundColor: theme.palette.background.paper,
            marginTop: theme.spacing(2),
        },
        paper: {
            marginBottom: theme.spacing(2),
            padding: '5px 30px',
            display: 'flex',
            // position: 'absolute',
            // alignItems: 'center',
            // justifyContent: 'center',
        },
        attractionsContainer: {
            display: 'flex',
            // alignItems: 'center',
            justifyContent: 'center',
        },
        card: {
            width: 300,
            marginBottom: 20,
        },
    
        iconButton: {
            padding: 10,
        },
        divider: {
            height: 28,
            margin: 4,
        },
        input: {
            margin: "0px 10px",
            width: "auto",
        },
        wrapper: {
            margin: theme.spacing(1),
            position: 'relative',
        },
        buttonSuccess: {
            backgroundColor: green[500],
            '&:hover': {
                backgroundColor: green[700],
            },
        },

        buttonProgress: {
            color: green[500],
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
          },
          media: {
            height: 140,
          },
          tab: {
            minWidth: 80,
          },
          panels: {
              position: 'absolute',
              display: 'inline',
              top: 100,
            left: 0,
          },
          map: {
            position: 'absolute',
            top: 50,
            left: 0,
          },
          
    }));
     
    const classes = useStyles()
    const timer = React.useRef();
    const buttonClassname = clsx({
        [classes.buttonSuccess]: success,
      });
   
    const AnyReactComponent = ( {text} ) => <div>{text}</div>

    return(
        <div className={classes.root}>
        
            <div className={classes.map} style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                bootstrapURLKeys={{ key: "AIzaSyA0J11Yrneq4iE90Gh29MEsTyDEs7C9zEE" }}
                defaultCenter={maps.center}
                defaultZoom={maps.zoom}
                >
                    <AnyReactComponent
                        lat={59.955413}
                        lng={30.337844}
                        text="My Marker"
                    />
                </GoogleMapReact>
            </div>
            <Container className={classes.panels} maxWidth="xl" mt={2}>
                <Helmet>
                    <title>Itinerary</title>
                </Helmet>
                <Paper  className={classes.paper} >
                    <Box flexGrow={1}>
                    <FormGroup aria-label="published" row>
                        <TextField
                            
                            id="itineraryName"
                            className={classes.input}
                            label="Name"
                            defaultValue="Name"
                            value={itinerary ? itinerary.name : 'Name'}
                            // variant="outlined"
                            onChange={(e) => setItinerary(prevState => ({
                                ...prevState,
                                name: e.target.value
                            }))}
                        
                        />
                        <TextField
                            id="destination"
                            className={classes.input}
                            label="Destination"
                            defaultValue="Destination"
                            value={itinerary ? itinerary.destination : 'Destination'}
                            // variant="outlined"
                            onChange={(e) => setItinerary(prevState => ({
                                ...prevState,
                                destination: e.target.value
                            }))}
                            
                        />
                        <TextField
                            id="trip_duration"
                            className={classes.input}
                            label="Duration"
                            defaultValue="1"
                            type="number"
                            value={itinerary ? itinerary.trip_duration : '1'}
                            // variant="outlined"
                            onChange={(e) => setItinerary(prevState => ({
                                ...prevState,
                                trip_duration: Number(e.target.value)
                            }))}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Days</InputAdornment>,
                                inputProps: { min: 1, max: 30 }
                            }}
                            
                        />
                        
                            <FormControlLabel
                                control={<Switch
                                    size="small"
                                    color="primary"
                                    checked={itinerary ? itinerary.published : true}
                                    value={itinerary ? itinerary.published : 0}
                                    onChange={(e) => setItinerary(prevState => ({
                                        ...prevState,
                                        published: e.target.checked
                                    }))}
                                    name="published"
                                    inputProps={{ 'aria-label': 'published' }}
                                />}
                                label="Published"
                                labelPlacement="top"
                            />
                        </FormGroup>
                    </Box>
                    
                    
                    <FormGroup aria-label="save" row>
                        <div className={classes.wrapper}>
                            <Button
                                variant="contained"
                                color="primary"
                                className={buttonClassname}
                                disabled={loading}
                                onClick={handleSaveButtonClick}
                                startIcon={<SaveIcon />}
                                style={{marginRight: 12}}
                                >
                                Save
                            </Button>
                            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </div>
                        <div className={classes.wrapper}>
                            <Button
                                variant="contained"
                                color="Secondary"
                                onClick={handleDeleteButtonClick}
                                startIcon={<DeleteIcon />}
                                >
                                Delete
                            </Button>
                        </div>
                    </FormGroup>
                    
                        
                    
                    
                </Paper>
                        
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Paper  className={classes.attractionsContainer}>
                            <div style={{ width: '100%' }}>
                            <Box component="span" display="block" p={1} m={1} >
                                <Typography variant="overline">
                                    Attractions
                                </Typography>
                            </Box>

                            <Box style={{maxHeight: 730, overflow: 'auto'}} component="span" display="block" p={1} m={1} >
                                <div id="external-events">
                                
                                    {attractions
                                        ? attractions.map((item) => {
                                            return (
                                                <Card className={`${classes.card} fc-event`} title={item.name}>
                                            
                                                    <CardMedia
                                                        className={classes.media}
                                                        image={item.photoUrl}
                                                        
                                                    />
                                                    <CardContent>
                                                        {item.name}
                                                                    
                                                        <Rating name="rating" readOnly="true" value={Math.round(item.rating * 2)/2} precision={0.5} />
                                                    </CardContent>
                                        
                                                </Card>
                                            )
                                    
                                        })
                                        : <CircularProgress/>
                                    }
                                </div>
                            </Box>
                        </div>
                        </Paper>

                        
                    </Grid>
                    <Grid item xs={6}>
                        <Box component="span" display="block" p={1} m={1} >
                            <Typography variant="overline">
                                Map
                            </Typography>
                           
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box component="span" display="block" p={1} m={1} >
                            <Typography variant="overline">
                                Itinerary
                            </Typography>
                        </Box>
                        <Tabs
                        value={daySelection}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="Day Selector Tab"
                        
                        >
                            {itinerary
                                    ? [...Array(itinerary.trip_duration)].map(
                                        (element, index) => (
                                            <Tab label={<React.Fragment>
                                                Day<br />
                                                {index + 1}
                                            </React.Fragment>}{...a11yProps(index)} classes={{root: classes.tab}}/>
                                        )
                                    )
                                : <CircularProgress/>
                            }
                                
                        </Tabs>
        
                        {itinerary ? 
                        
                            <FullCalendar
                                rerenderDelay={10}
                                ref={calendarRef}
                                plugins={[ timeGridPlugin, interactionPlugin ]}
                                initialView="timeGridDay"
                                editable={ true }
                                droppable={true}
                                dragRevertDuration={0}
                                headerToolbar={ false }
                                height={ 650 }
                                allDaySlot={ false }
                                scrollTime={ '07:00:00'}
                                dayHeaderContent= {"Day "+ (daySelection + 1)} 
                                initialDate={"2050-01-01"}
                                eventClick={eventClick}
                                // eventChange={eventChange}
                                // drop={eventChange}
                                eventsSet={eventChange}
                                initialEvents={itinerary.itinerary}
                                forceEventDuration={ true }
                            /> 
                        : <CircularProgress/>}              
                        
                        
        
                        
                    </Grid>
                </Grid>
            
            </Container>
        </div>
            
    )


}

export default withRouter(Itinerary)


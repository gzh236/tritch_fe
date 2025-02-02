import React, { useEffect, useRef, useState } from "react";
import { Link, withRouter } from "react-router-dom";
import Cookies from "js-cookie";
import logo  from '../images/logo.png'
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Box from '@material-ui/core/Box'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar
}));

function Navbar(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const verifiedUser = Cookies.get("auth_token");

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  function handleLogout(e) {
    Cookies.remove("auth_token");
    props.history.push("/");
  }

  return (
    <div className={classes.root}>
      <AppBar style={{ background: "#9c27b0" }} position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          ></IconButton>
          <Typography
            component={Link}
            style={{ textDecoration: "none" }}
            to="/"
            variant="h6"
            color="inherit"
            className={classes.title}
          >
            <Box mt={2} >
              <img src={logo} alt="TRITCH" className={classes.logo} />
            </Box>
            
          </Typography>
          <Button 
            color="inherit"
            component={Link}
            to={"/tripplanner"}
            >
              Trip Planner
            </Button>
          <Button component={Link} to="/discover" color="inherit">
            Discover
          </Button>
          {verifiedUser ? (
            <div className="authenticatedOnly">
              <Button
                color="inherit"
                ref={anchorRef}
                aria-controls={open ? "menu-list-grow" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                Dashboard
              </Button>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          autoFocusItem={open}
                          id="menu-list-grow"
                          onKeyDown={handleListKeyDown}
                        >
                          <MenuItem
                            component={Link}
                            to={`/users/profile`}
                            onClick={handleClose}
                          >
                            My Profile
                          </MenuItem>
                          <MenuItem
                            component={Link}
                            to={`/users/itineraries`}
                            onClick={handleClose}
                          >
                            My Itineraries
                          </MenuItem>
                          <MenuItem
                            component={Link}
                            to={`/users/bucketlist`}
                            onClick={handleClose}
                          >
                            My Bucketlist
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
              <Button
                onClick={(e) => {
                  handleLogout(e);
                }}
                color="inherit"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="unauthenticatedOnly">
              <Button component={Link} to="/users/login" color="inherit">
                Login
              </Button>
              <Button component={Link} to="/users/register" color="inherit">
                Register
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(Navbar);

import React, { useState, useEffect,  } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

import { client as freshClient } from "../../services/FreshService";
import { client as devpieClient } from "../../services/APIService";

 const FreshModal = () => {

  const { auth0Id, accountingEnabled, roles } = useSelector(
    (state: RootState) => state.auth
  );

  const [isOpen, setOpen] = useState(false);
  const isFreelancer = roles.includes("freelancer")

  useEffect(()=> {
    if(isFreelancer) {
      freshClient.isTokenVerifed().then((isVerified) => {
        if(!isVerified) {
          setOpen(true)
        }
        if(isVerified && !accountingEnabled) {
          devpieClient.request("POST", "/accounting", { auth0Id, token: freshClient.access_token } )
        }
      })
    }
  },[])

  const goToFreshbooksAccountLogin = ()=> freshClient.loginWithRedirect()

  if(!isFreelancer) {
    return null;
  }

  return (
    <Dialog
      data-test="component-freshbooks-modal"
      open={isOpen}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        Welcome Freelancer!
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          DevPie Client uses Freshbooks accounting software for freelancers.
        </DialogContentText>

        <DialogContentText>
          Sign into your Freshbooks account or create one.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={goToFreshbooksAccountLogin}
          color="secondary"
          autoFocus={true}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { FreshModal };
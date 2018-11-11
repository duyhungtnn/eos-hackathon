import React, { Component } from 'react';
import { Api, JsonRpc, RpcError, JsSignatureProvider } from 'eosjs'; // https://github.com/EOSIO/eosjs
import { TextDecoder, TextEncoder } from 'text-encoding';

// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

// eosio endpoint
const endpoint = "http://localhost:8888";

// NEVER store private keys in any source code in your real life development
// This is for demo purposes only!
const accounts = [
  {"name":"useraaaaaaaa", "privateKey":"5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5", "publicKey":"EOS6kYgMTCh1iqpq9XGNQbEi8Q6k5GujefN9DSs55dcjVyFAq7B6b"},
  {"name":"useraaaaaaab", "privateKey":"5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg", "publicKey":"EOS78RuuHNgtmDv9jwAzhxZ9LmC6F295snyQ9eUDQ5YtVHJ1udE6p"},
  {"name":"useraaaaaaac", "privateKey":"5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7", "publicKey":"EOS5yd9aufDv7MqMquGcQdD6Bfmv6umqSuh9ru3kheDBqbi6vtJ58"},
  {"name":"useraaaaaaad", "privateKey":"5KNm1BgaopP9n5NqJDo9rbr49zJFWJTMJheLoLM5b7gjdhqAwCx", "publicKey":"EOS8LoJJUU3dhiFyJ5HmsMiAuNLGc6HMkxF4Etx6pxLRG7FU89x6X"},
  {"name":"useraaaaaaae", "privateKey":"5KE2UNPCZX5QepKcLpLXVCLdAw7dBfJFJnuCHhXUf61hPRMtUZg", "publicKey":"EOS7XPiPuL3jbgpfS3FFmjtXK62Th9n2WZdvJb6XLygAghfx1W7Nb"},
  {"name":"useraaaaaaaf", "privateKey":"5KaqYiQzKsXXXxVvrG8Q3ECZdQAj2hNcvCgGEubRvvq7CU3LySK", "publicKey":"EOS5btzHW33f9zbhkwjJTYsoyRzXUNstx1Da9X2nTzk8BQztxoP3H"},
  {"name":"useraaaaaaag", "privateKey":"5KFyaxQW8L6uXFB6wSgC44EsAbzC7ideyhhQ68tiYfdKQp69xKo", "publicKey":"EOS8Du668rSVDE3KkmhwKkmAyxdBd73B51FKE7SjkKe5YERBULMrw"}
];
// set up styling classes using material-ui "withStyles"
const styles = theme => ({
  card: {
    margin: 20,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  formButton: {
    marginTop: theme.spacing.unit,
    width: "100%",
  },
  pre: {
    background: "#ccc",
    padding: 10,
    marginBottom: 0,
  },
});

// Index component
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // this is where you define the state variable
      personinfo: [ {}],
      amountpaid: [{}],
      propertyinfo: [{}],
      properties: {}

    };

    this.handleFormEvent = this.handleFormEvent.bind(this);
  }

  // generic function to handle form events (e.g. "submit" / "reset")
  // push transactions to the blockchain by using eosjs
  async handleFormEvent(event) {
    // stop default behaviour
    event.preventDefault();

    // collect form data
    let account = event.target.account.value;
    let privateKey = event.target.privateKey.value;
    let note = event.target.note.value;

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    // define actionName and action according to event type
    switch (event.type) {
      case "submit":
        actionName = "update";
        actionData = {
          user: account,
          note: note,
        };
        break;
      default:
        return;
    }

    // eosjs function call: connect to the blockchain
    const rpc = new JsonRpc(endpoint);
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    try {
      const result = await api.transact({
        actions: [{
          account: "notechainacc",
          name: actionName,
          authorization: [{
            actor: account,
            permission: 'active',
          }],
          data: actionData,
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
    } catch (e) {
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    }
  }

// called thse three tablrse readers
  getProfiles() {
    const rpc = new JsonRpc(endpoint);
    rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": "notechainacc",  // scope of the table
      "table": "profiles",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => {
      //this is where you set the state variable to have the object
      this.state.personinfo = result.rows;
      this.setState({ state: this.state });
    });
  }

  getProperties() {
    const rpc = new JsonRpc(endpoint);
    rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": "notechainacc",  // scope of the table
      "table": "properties",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => {
      this.state.propertyinfo = result.rows;
      this.setState({state: this.state});
      if(this.state.propertyinfo.length != result.rows.length) {
        this.refinePropertyObjects();
      }
    });
}
// address, city, offer, photo_url, state

  getStakersByProperty(propertyId) {
    const rpc = new JsonRpc(endpoint);
    rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": propertyId,  // scope of the table
      "table": "stakers",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => {
      this.state.amountpaid = result.rows;
      this.setState({state: this.state});
    })
  }


  loadStakersIntoProperty(propertyId) {
    const rpc = new JsonRpc(endpoint);
    rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": propertyId,  // scope of the table
      "table": "stakers",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => {
      if(!this.state.properties.hasOwnProperty(propertyId)) {
        this.state.properties[propertyId] = {};
      }
      //console.log("BEFORE ADDING STAKERS for propdId: " + propertyId)
      //console.log("this.state.properties is " + JSON.stringify(this.state.properties[propertyId]))
      //console.log("??? STAKERS ARE " + JSON.stringify(result.rows))

      if(!this.state.properties[propertyId].hasOwnProperty('propertyinfo')) {
        this.state.properties[propertyId].propertyinfo = {};
      }
      if(!this.state.properties[propertyId].hasOwnProperty('stakers')) {
        this.state.properties[propertyId].stakers = [];
      }
      if(result.rows.length > 0) {
        this.state.properties[propertyId].stakers = result.rows
      }
      //console.log(JSON.stringify(this.state.properties))
      this.setState({state: this.state});
    });
  }

  refinePropertyObjects() {
    this.getProfiles();
    this.getProperties();
    this.state.propertyinfo.map((row, i) => {
      if(row.prim_key == undefined) {
        return;
      }
      this.getStakersByProperty(row.prim_key);
      if(!this.state.properties.hasOwnProperty(row.prim_key)) {
        this.state.properties[row.prim_key] = {};
      }
      if(!this.state.properties[row.prim_key].hasOwnProperty('propertyinfo')) {
        this.state.properties[row.prim_key].propertyinfo = [];
      }
      console.log(">>>> this.state.properties " + JSON.stringify(this.state.propertyinfo))
      console.log(">>>> adding to this.state.properties " + row.prim_key)


      this.state.properties[row.prim_key].propertyinfo = row
      this.setState({state: this.state});
      this.loadStakersIntoProperty(row.prim_key);
    });
  }

// called everytime you reffresh the paeg chicago
  componentDidMount() {
    this.refinePropertyObjects();
    setInterval(() => {
      this.refinePropertyObjects()
    }, 2000);
  }

  componentDidUpdate(prevProps) {

  }

  render() {
    // add to this
    const { personinfo, amountpaid, propertyinfo, properties } = this.state;
    const { classes, updated } = this.props;

      const generateInfoCard = (key, fullname, photo_url) => (
        <Card className={classes.card} key={key}>
          <CardContent>
            <Typography variant="headline" component="h2">
              {fullname}
            </Typography>
            <Typography component="pre">
              {photo_url}
            </Typography>
          </CardContent>
        </Card>
      );

      const propertiesInfoCard = (key, property_info) => {
        let stakers = (<span/>);
        if(property_info.stakers != undefined) {
          stakers = property_info.stakers.map((element) => {
            return (
              <Card className={classes.card} key={key}>
                <CardContent>
                  <Typography variant="headline" component="h2">
                    {element.user}
                  </Typography>
                  <Typography component="pre">
                    {element.quantity}
                  </Typography>
                </CardContent>
              </Card>
            )
          })
        }
        return (
          <Card className={classes.card} key={key}>
            <CardContent>
              <Typography variant="headline" component="h2">
                Address: {property_info.propertyinfo.address}
              </Typography>
              <Typography component="pre">
                Photo: {property_info.propertyinfo.photo_url}
              </Typography>
              <Typography component="pre">
                City: {property_info.propertyinfo.city}
              </Typography>
              <Typography component="pre">
                State: {property_info.propertyinfo.state}
              </Typography>
              <Typography component="pre">
                Price: {property_info.propertyinfo.offer}
              </Typography>
              <Typography component="pre">
                ID: {property_info.propertyinfo.property_id}
              </Typography>
              <br/>
              Investors:
              <Typography component="pre">
                {stakers}
              </Typography>
            </CardContent>
          </Card>
        );
      }

      const propertyInfoCard = (key, address, city, offer, photo_url, state, property_id) => {
        return (
          <Card className={classes.card} key={key}>
            <CardContent>
              <Typography variant="headline" component="h2">
                {address}
              </Typography>
              <Typography component="pre">
                {photo_url}
              </Typography>
              <Typography component="pre">
                {city}
              </Typography>
              <Typography component="pre">
                {state}
              </Typography>
              <Typography component="pre">
                {offer}
              </Typography>
              <Typography component="pre">
                {property_id}
              </Typography>
            </CardContent>
          </Card>
        );
      }
      // address, city, offer, photo_url, stateÍ

      const generateAmountPaidCard = (key, user, amountPaid) => (
        <Card className={classes.card} key={key}>
          <CardContent>
            <Typography variant="headline" component="h2">
              {user}
            </Typography>
            <Typography component="pre">
              {amountPaid}
            </Typography>
          </CardContent>
        </Card>
      );


      let personinfox = personinfo.map((row, i) => {
        return generateInfoCard(i, row.fullname, row.photo_url);
      });

      let amountpaidforhouse = amountpaid.map((row, i) => {
        return generateAmountPaidCard(i, row.user, row.quantity);
      });

      let propertyinfox = propertyinfo.map((row, i) => {
        return propertyInfoCard(i, row.address, row.city, row.state, row.offer, row.photo_url, row.prim_key);
      });

      let new_props = [];
      Object.keys(properties).forEach(function(key) {
          if(properties[key].propertyinfo == undefined) {
            return {}
          }
          new_props.push(properties[key]);
      });

      let newpropcards = new_props.map((row, i) => {
        return propertiesInfoCard(Math.random(), row)
      });


    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              HomeStake
            </Typography>
          </Toolbar>
        </AppBar>


        {newpropcards}

        <Paper className={classes.paper}>
          <form onSubmit={this.handleFormEvent}>
            <TextField
              name="account"
              autoComplete="off"
              label="Account"
              margin="normal"
              fullWidth
            />
            <TextField
              name="privateKey"
              autoComplete="off"
              label="Private key"
              margin="normal"
              fullWidth
            />
            <TextField
              name="propertyId"
              autoComplete="off"
              label="Property ID"
              margin="normal"
              fullWidth
            />
            <TextField
              name="contribution"
              autoComplete="off"
              label="Contribution (EOS)"
              margin="normal"
              multiline
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.formButton}
              type="submit">
              Add / Update note
            </Button>
          </form>
        </Paper>
        <pre className={classes.pre}>
          Below is a list of pre-created accounts information for add/update note:
          <br/><br/>
          accounts = { JSON.stringify(accounts, null, 2) }
        </pre>
      </div>
    );
  }

}

export default withStyles(styles)(Index);

import React, { Component } from 'react'

import {
  Text,
  View,
  StyleSheet,
  Button,
  Alert
} from 'react-native'
import * as firebase from 'firebase'
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin/GoogleSignin'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

const gAuthProvider = new firebase.auth.GoogleAuthProvider()

const config = {
  apiKey: 'AIzaSyBgiv2CAsvosW3RFsS8SYv9JhVeYJLWRYo',
  authDomain: 'lcc-wifi.firebaseapp.com',
  databaseURL: 'https://lcc-wifi.firebaseio.com',
  projectId: 'lcc-wifi',
  storageBucket: 'lcc-wifi.appspot.com',
  messagingSenderId: '1038104580431'
}

firebase.initializeApp(config)

GoogleSignin.configure({
  webClientId: '1038104580431-bakjtdg9bapemb51kif2cdm4fgs4paaf.apps.googleusercontent.com',
  forceConsentPrompt: true,
  accountName: '',
  hostedDomain: ''
}).then(() => {})

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {page: 'login'}

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user: user, page: 'main'})
      } else {
        this.setState({user: null, page: 'login'})
      }
    })
  }

  login () {
    GoogleSignin.signIn()
      .then((user) => {
        const credential = gAuthProvider.credential(user.idToken)
        firebase.auth().signInWithCredential(credential).catch((err) => {
          Alert.alert('Login Error', err.message, [
            {text: 'OK'}
          ])
        })
      })
      .catch((err) => {
        console.error(err)
        Alert.alert('Login Error', err.message, [
          {text: 'OK'}
        ])
      })
      .done()
  }

  render () {
    if (this.state.page === 'login') {
      return (
        <View style={styles.container}>
          <Text style={styles.fullHeader}>
            Login to LCC WiFi
          </Text>
          <GoogleSigninButton
            style={{width: 312, height: 48}}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={this.login.bind(this)}
          />
        </View>
      )
    } else if (this.state.page === 'main') {
      return (
        <View style={styles.container}>
          <AnimatedCircularProgress
            style={styles.progress}
            size={360}
            width={2}
            rotation={0}
            fill={100}
            tintColor="#00e0ff">
            {
              (fill) => (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    1.72 / 2.00 GB
                  </Text>
                </View>
              )
            }
          </AnimatedCircularProgress>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  progress: {
    zIndex: 100,
    width: 380
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressText: {
    fontSize: 40
  },
  fullHeader: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
})

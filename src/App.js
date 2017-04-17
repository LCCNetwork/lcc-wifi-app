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
    fontSize: 60,
    textAlign: 'center',
    margin: 10
  },
  connected: {
    color: '#10af10',
    fontSize: 40,
    textAlign: 'center',
    margin: 10
  },
  disconnected: {
    color: 'red',
    fontSize: 40,
    textAlign: 'center',
    margin: 10
  },
  connecting: {
    color: '#00e0ff',
    fontSize: 40,
    textAlign: 'center',
    margin: 10
  }
})

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
  iosClientId: '1038104580431-m4mlavare0gburlegl0tphn7oqlvhai0.apps.googleusercontent.com',
  forceConsentPrompt: true,
  accountName: '',
  hostedDomain: ''
}).then(() => {})

export default class App extends Component {
  constructor (props) {
    super(props)

    this.state = {user: null, page: 'login', data: null, connected: false}

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user: user,
          page: 'main',
          data: {
            used: 1,
            total: 1
          },
          connected: 'Connecting'
        })
        this.reload()
      } else {
        this.setState({user: null, page: 'login', data: null, connected: false})
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
    }).catch((err) => {
      console.error(err)
      Alert.alert('Login Error', err.message, [
        {text: 'OK'}
      ])
    }).done()
  }

  reload () {
    let timeout = new Promise((resolve, reject) => {
      setTimeout(reject, 1000, 'request timed out')
    })

    this.state.user.getToken(true).then((token) => {
      Promise.race([timeout,
          fetch('http://10.240.20.154:8080/auth', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token: token
            })
          })
      ]).then((response) => response.json()).then((responseJson) => {
        if (responseJson.auth) {
          fetch('http://10.240.20.154:8080/user/' + this.state.user.uid, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          }).then((response) => response.json()).then((responseJson) => {
            this.setState({
              user: this.state.user,
              page: 'main',
              data: responseJson,
              connected: this.state.connected
            })
          }).catch((err) => {
            firebase.auth().signOut()

            console.log(err)

            Alert.alert('Not Connected', 'Please make sure you are connected to the LCC WiFi network.', [
              {text: 'OK'}
            ])
          })
          this.setState({
            user: this.state.user,
            page: this.state.page,
            data: this.state.data,
            connected: true
          })
        } else {
          firebase.auth().signOut()

          Alert.alert('Not Authorized', 'This account is not authorized to use the LCC WiFi network.', [
            {text: 'OK'}
          ])
        }
      }).catch((err) => {
        firebase.auth().signOut()

        console.log(err)

        Alert.alert('Not Connected', 'Please make sure you are connected to the LCC WiFi network.', [
          {text: 'OK'}
        ])
      })
    }).catch((err) => {
      firebase.auth().signOut()

      console.log(err)

      Alert.alert('Auth Error', 'Please make sure you are connected to the LCC WiFi network.', [
        {text: 'OK'}
      ])
    })
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
          <Text style={styles.fullHeader}>
            Data Usage
          </Text>
          <AnimatedCircularProgress
            style={styles.progress}
            size={360}
            width={2}
            rotation={0}
            fill={this.state.data.used / this.state.data.total * 100}
            tintColor="#00e0ff">
            {
              (fill) => (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {(this.state.data.used / 1000).toFixed(2)} / {(this.state.data.total / 1000).toFixed(2)} GB
                  </Text>
                </View>
              )
            }
          </AnimatedCircularProgress>
          <Text style={this.state.connected ? (this.state.connected === 'Connecting' ? styles.connecting : styles.connected) : styles.connected}>
            {this.state.connected ? (this.state.connected === 'Connecting' ? 'Connecting' : 'Connected') : 'Disconnected'}
          </Text>
          <Button title={'Refresh'} onPress={this.reload.bind(this)} />
        </View>
      )
    }
  }
}

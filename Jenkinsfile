pipeline {
  agent {
    docker {
      image 'elixir'
    }
    
  }
  stages {
    stage('build') {
      steps {
        echo 'Hello!'
        sh 'mix deps.get --force'
      }
    }
    stage('cenas') {
      steps {
        input 'sdsfsdfsdf'
        echo 'GO'
      }
    }
  }
}
pipeline {
    agent any

    environment {
        FRONTEND_IMAGE_DEV = "rublin322/picscore-frontend:develop"
        BACKEND_IMAGE_DEV = "rublin322/picscore-backend:develop"
        FRONTEND_IMAGE_PROD = "rublin322/picscore-frontend:latest"
        BACKEND_IMAGE_PROD = "rublin322/picscore-backend:latest"
        EC2_DEPLOY_HOST = "ubuntu@j12b104.p.ssafy.io"
        EC2_DEPLOY_PATH = "/home/ubuntu/picscore"
        GCP_DEPLOY_HOST = "rublin322@picscore.net"
        GCP_DEPLOY_PATH = "/home/rublin322/picscore"

        SONAR_HOST = "http://3.36.77.223:9000"
        SONAR_PROJECT_KEY_BACKEND = "picscore-backend"
        SONAR_PROJECT_KEY_FRONTEND = "picscore-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "현재 브랜치: ${env.BRANCH_NAME}"
                    echo "현재 워크스페이스: ${env.WORKSPACE}"
                }
            }
        }

        stage('Prepare Environment') {
            steps {
                withCredentials([file(credentialsId: 'env-dev-content', variable: 'ENV_DEV_PATH')]) {
                    script {
                        def envdevContent = readFile(ENV_DEV_PATH)
                        writeFile file: '.env.dev', text: envdevContent
                    }
                }
                withCredentials([file(credentialsId: 'env-prod-content', variable: 'ENV_PROD_PATH')]) {
                    script {
                        def envprodContent = readFile(ENV_PROD_PATH)
                        writeFile file: '.env.prod', text: envprodContent
                    }
                }
                withCredentials([file(credentialsId: 'env-front-dev-content', variable: 'ENV_FRONT_DEV_PATH')]) {
                    script {
                        def envfrontdevContent = readFile(ENV_FRONT_DEV_PATH)
                        writeFile file: '.env.front.dev', text: envfrontdevContent
                    }
                }
                withCredentials([file(credentialsId: 'env-front-prod-content', variable: 'ENV_FRONT_PROD_PATH')]) {
                    script {
                        def envfrontprodContent = readFile(ENV_FRONT_PROD_PATH)
                        writeFile file: '.env.front.prod', text: envfrontprodContent
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                     branch 'develop'
            }
            steps {
                // 백엔드 분석
                dir('backend') {
                    withCredentials([string(credentialsId: 'sonarqube-backend-token', variable: 'SONAR_BACK_TOKEN')]) {
                        sh "chmod +x ./gradlew"
                        sh """
                        ./gradlew clean build -x test
                        ./gradlew sonarqube \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY_BACKEND} \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.login=${SONAR_BACK_TOKEN} \
                        """
                    }
                }
                
                // 프론트엔드 분석
                dir('frontend') {
                    withCredentials([string(credentialsId: 'sonarqube-frontend-token', variable: 'SONAR_FRONT_TOKEN')]) {
                        sh """
                        npm install
                        npx sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY_FRONTEND} \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.login=${SONAR_FRONT_TOKEN} \
                            -Dsonar.tests='' \
                            -Dsonar.test.inclusions='' \
                            -Dsonar.coverage.exclusions='**/*'
                        """
                    }
                }
            }
        }

        stage('Build and Deploy') {
            parallel {
                stage('Develop Branch - EC2 Deployment') {
                    when {
                        anyOf {
                            branch 'develop'
                            branch 'frontend'
                            branch 'backend'
                        }
                    }
                    stages {
                        stage('Build Docker Images - Dev') {
                            steps {
                                dir('frontend') {
                                    sh "cp ../.env.front.dev .env.front"
                                    sh "docker build -t ${FRONTEND_IMAGE_DEV} ."

                                    withCredentials([string(credentialsId: 'sentry-auth-token', variable: 'SENTRY_AUTH_TOKEN')]) {
                                        dir('frontend') {
                                            sh """
                                                npm install -g @sentry/cli

                                                export SENTRY_ORG=comp-6d
                                                export SENTRY_PROJECT=picscore
                                                export SENTRY_AUTH_TOKEN=\${SENTRY_AUTH_TOKEN}
                                                export SENTRY_URL=https://sentry.io/ # 필요 시 변경

                                                VERSION_TAG=\$(git rev-parse --short HEAD)
                                                sentry-cli releases new picscore@\${VERSION_TAG}
                                                sentry-cli releases set-commits picscore@\${VERSION_TAG} --auto --ignore-missing

                                                # sourcemap 업로드
                                                sentry-cli releases files picscore@\${VERSION_TAG} upload-sourcemaps dist/assets \
                                                --url-prefix "~/assets" \
                                                --validate \
                                                --rewrite

                                                sentry-cli releases finalize picscore@\${VERSION_TAG}
                                            """
                                        }
                                    }
                                }
                                dir('backend') {
                                    sh "docker build -t ${BACKEND_IMAGE_DEV} ."
                                }
                            }
                        }
                        stage('Push to DockerHub') {
                            steps {
                                withDockerRegistry([credentialsId: 'dockerhub-token', url: '']) {
                                    sh "docker push ${FRONTEND_IMAGE_DEV}"
                                    sh "docker push ${BACKEND_IMAGE_DEV}"
                                }
                            }
                        }
                        stage('Deploy to EC2') {
                            steps {
                                sshagent(credentials: ['ec2-ssh-key']) {
                                    sh "scp -o StrictHostKeyChecking=no .env.dev ${EC2_DEPLOY_HOST}:${EC2_DEPLOY_PATH}/.env"
                                    sh "scp -o StrictHostKeyChecking=no .env.front.dev ${EC2_DEPLOY_HOST}:${EC2_DEPLOY_PATH}/.env.front"

                                    sh "scp -o StrictHostKeyChecking=no docker-compose-dev.yml ${EC2_DEPLOY_HOST}:${EC2_DEPLOY_PATH}/docker-compose.yml"
                                    sh "scp -o StrictHostKeyChecking=no ./nginx-dev.conf ${EC2_DEPLOY_HOST}:${EC2_DEPLOY_PATH}/nginx-dev.conf"
                                    sh "scp -o StrictHostKeyChecking=no prometheus.yml ${EC2_DEPLOY_HOST}:${EC2_DEPLOY_PATH}/prometheus.yml"

                                    sh """
                                    ssh -o StrictHostKeyChecking=no ${EC2_DEPLOY_HOST} '
                                        cd ${EC2_DEPLOY_PATH} &&
                                        docker compose down --remove-orphans &&
                                        docker pull ${FRONTEND_IMAGE_DEV} &&
                                        docker pull ${BACKEND_IMAGE_DEV} &&
                                        export FRONTEND_IMAGE=${FRONTEND_IMAGE_DEV} &&
                                        export BACKEND_IMAGE=${BACKEND_IMAGE_DEV} &&
                                        docker compose up -d &&
                                        docker container prune -f &&
                                        docker image prune -f &&
                                        docker volume prune -f
                                    '
                                    """
                                }
                            }
                        }
                    }
                }

                stage('Master Branch - DockerHub & GCP Deployment') {
                    when {
                        branch 'master'
                    }
                    stages {
                        stage('Build Docker Images - Prod') {
                            steps {
                                dir('frontend') {
                                    sh "cp ../.env.front.prod .env.front"
                                    sh "docker build -t ${FRONTEND_IMAGE_PROD} ."

                                    withCredentials([string(credentialsId: 'sentry-auth-token', variable: 'SENTRY_AUTH_TOKEN')]) {
                                        dir('frontend') {
                                            sh """
                                                npm install -g @sentry/cli

                                                export SENTRY_ORG=comp-6d
                                                export SENTRY_PROJECT=picscore
                                                export SENTRY_AUTH_TOKEN=\${SENTRY_AUTH_TOKEN}
                                                export SENTRY_URL=https://sentry.io/ # 필요 시 변경

                                                VERSION_TAG=\$(git rev-parse --short HEAD)
                                                sentry-cli releases new picscore@\${VERSION_TAG}
                                                sentry-cli releases set-commits picscore@\${VERSION_TAG} --auto --ignore-missing

                                                # sourcemap 업로드
                                                sentry-cli releases files picscore@\${VERSION_TAG} upload-sourcemaps dist/assets \
                                                --url-prefix "~/assets" \
                                                --validate \
                                                --rewrite

                                                sentry-cli releases finalize picscore@\${VERSION_TAG}
                                            """
                                        }
                                    }
                                }
                                dir('backend') {
                                    sh "docker build -t ${BACKEND_IMAGE_PROD} ."
                                }
                            }
                        }
                        stage('Push to DockerHub') {
                            steps {
                                withDockerRegistry([credentialsId: 'dockerhub-token', url: '']) {
                                    sh "docker push ${FRONTEND_IMAGE_PROD}"
                                    sh "docker push ${BACKEND_IMAGE_PROD}"
                                }
                            }
                        }
                        stage('Deploy to GCP') {
                            steps {
                                sshagent(credentials: ['gcp-ssh-key']) {
                                    sh "scp -o StrictHostKeyChecking=no .env.prod ${GCP_DEPLOY_HOST}:${GCP_DEPLOY_PATH}/.env"
                                    sh "scp -o StrictHostKeyChecking=no .env.front.prod ${GCP_DEPLOY_HOST}:${GCP_DEPLOY_PATH}/.env.front"

                                    sh "scp -o StrictHostKeyChecking=no docker-compose-prod.yml ${GCP_DEPLOY_HOST}:${GCP_DEPLOY_PATH}/docker-compose.yml"
                                    sh "scp -o StrictHostKeyChecking=no ./nginx-prod.conf ${GCP_DEPLOY_HOST}:${GCP_DEPLOY_PATH}/nginx-prod.conf"
                                    sh "scp -o StrictHostKeyChecking=no prometheus.yml ${GCP_DEPLOY_HOST}:${GCP_DEPLOY_PATH}/prometheus.yml"

                                    sh """
                                    ssh -o StrictHostKeyChecking=no ${GCP_DEPLOY_HOST} '
                                        cd ${GCP_DEPLOY_PATH} &&
                                        docker compose down --remove-orphans &&
                                        docker pull ${FRONTEND_IMAGE_PROD} &&
                                        docker pull ${BACKEND_IMAGE_PROD} &&
                                        export FRONTEND_IMAGE=${FRONTEND_IMAGE_PROD} &&
                                        export BACKEND_IMAGE=${BACKEND_IMAGE_PROD} &&
                                        docker compose up -d &&
                                        docker container prune -f &&
                                        docker image prune -f &&
                                        docker volume prune -f
                                    '
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'backend' || env.BRANCH_NAME == 'backend') {
                    echo '개발 환경(EC2) 배포 성공'
                } else if (env.BRANCH_NAME == 'master') {
                    echo '운영 환경(GCP) 배포 성공'
                }
            }
        }
        failure {
            script {
                if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'backend' || env.BRANCH_NAME == 'backend') {
                    echo '개발 환경(EC2) 배포 실패'
                } else if (env.BRANCH_NAME == 'master') {
                    echo '운영 환경(GCP) 배포 실패'
                }
            }
        }
        always {
            echo '배포 파이프라인 종료'
            cleanWs()
        }
    }
}
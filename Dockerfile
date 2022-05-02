FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive

# Initial update and some basics.
# This odd double update seems necessary to get curl to download without 404 errors.
RUN apt-get update --fix-missing && \
apt-get install -y wget && \
apt-get update && \
apt-get install -y curl && \
apt-get update

# install nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash - && \
apt-get install -y nodejs

RUN apt-get install -y git

RUN mkdir /logs

ADD clone_project.sh /root

RUN /root/clone_project.sh

RUN cd /root/app-server-api; npm install 

# Set password length and expiry for compliance with vulnerability advisor
# RUN sed -i 's/sha512/sha512 minlen=8/' /etc/pam.d/common-password
# RUN sed -i 's/PASS_MIN_DAYS.*/PASS_MIN_DAYS   1/' /etc/login.defs
# RUN sed -i 's/PASS_MAX_DAYS.*/PASS_MAX_DAYS   90/' /etc/login.defs

# Final steps
EXPOSE 80
CMD ["/bin/bash", "-c", "cd /root/app-server-api && node ./app.js"]
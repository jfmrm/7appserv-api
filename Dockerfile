FROM node:6.6

RUN mkdir www

RUN npm install -g nodemon

WORKDIR www

EXPOSE 3000

CMD ["npm", "run", "firstStart"]

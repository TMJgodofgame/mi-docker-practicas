FROM python
RUN pip install flask
RUN pip install mysql-connector-python
WORKDIR /app
COPY python/app.py ./app.py
COPY templates/ ./templates/
EXPOSE 5000
CMD [ "python", "app.py" ]
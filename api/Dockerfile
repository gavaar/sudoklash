FROM rust:1.70 as builder

WORKDIR /t

COPY . .
RUN cargo build --release

FROM debian:buster-slim

WORKDIR /app

COPY --from=builder ./t/target/release/sudoklash-api .

EXPOSE 8080

CMD [ "./sudoklash-api" ]

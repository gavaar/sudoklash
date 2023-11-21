FROM --platform=$BUILDPLATFORM docker.io/library/node:current as base

# as of 20-11-23 oven/bun image is not working for this particular project so we install it with npm
RUN npm install --global bun

WORKDIR /t

COPY . .

RUN bun install
RUN bun run build

# Use official nginx image as the base image
FROM pierrezemb/gostatic

# Copy the build output to replace the default nginx contents.
COPY --from=base /t/dist/sudoklash-ui /srv/http/

EXPOSE 8043

CMD ["-fallback", "index.html"]

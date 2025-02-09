"use client";
import { Box, Heading, Button, Image } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box
      m={"12"}
      mb={"0"}
      display={"flex"}
      flexDirection={{ base: "column", lg: "row" }}
      alignItems={{ base: "center", lg: "flex-start" }}>
      {/* Left Side - Text Content */}
      <Box
        flex={1}
        display={"flex"}
        flexDirection={"column"}
        alignItems={{ lg: "flex-start", base: "center" }}>
        <Box fontSize={"lg"} w={"fit"}>
          PROJECT PLANNER &nbsp;
        </Box>
        <Heading
          fontSize={{ lg: "9xl", base: "7xl" }}
          w={"fit"}
          mt={{ lg: "28", base: "12" }}
          color={"ourBlue"}
          fontWeight={"semibold"}>
          DYNAMIC
        </Heading>
        <Heading
          fontSize={{ lg: "9xl", base: "7xl" }}
          mt={{ lg: "28", base: "12" }}
          fontWeight={"semibold"}>
          CALENDAR
        </Heading>
        <Heading
          fontSize={{ lg: "9xl", base: "7xl" }}
          mt={{ lg: "28", base: "12" }}
          fontWeight={"semibold"}>
          PLANNER
        </Heading>

        <Box fontSize={"xl"} display={"flex"} mt={{ lg: "28", base: "12" }}>
          <Box mr={"12"} padding={"1.5"}>EXPERIENCE EFFICIENCY</Box>
          <Button padding={"3"} rounded={"xl"} backgroundColor={"white"}>
            SIGN UP NOW
          </Button>
        </Box>
      </Box>

      {/* Right Side - Image */}
      <Box
        flex={1}
        mt={"-12"}
        mr={"-12"}
        display={"flex"}
        justifyContent={{ base: "center", lg: "flex-end" }}>
        <Image
          src={"/womanWritingOnCalendar.jpg"}
          h={"100vh"}
          width={"2xl"}
        />
        <Box
          position={"absolute"}
          w={"2xl"}
          h={"100%"}
          bgGradient={"to-r"}
          gradientFrom={"ourBg"}
          gradientTo={"transparent"}
          >
        </Box>
      </Box>
    </Box>
  );
}

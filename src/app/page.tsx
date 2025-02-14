"use client";
import { Box, Heading, Button } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box
      m={"12"}
      mb={"0"}
      display={"flex"}
      flexDirection={{ base: "column", lg: "row" }}
      alignItems={{ base: "center", lg: "flex-start" }}>
      <Box
        zIndex={"1"}
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
          <Box mr={"12"} padding={"1.5"}>
            EXPERIENCE EFFICIENCY
          </Box>
          <Button padding={"3"} rounded={"xl"} backgroundColor={"white"}>
            SIGN UP NOW
          </Button>
        </Box>
      </Box>

      <Box
        display="block"
        position="absolute"
        top="0"
        height="100vh"
        width="100%"
        bgImage= "url('womanWritingOnCalendar.jpg')"
        z-index="-3"
        lg={{
          position: "static",
          flex: 1,
          mt: "-12",
          mr: "-12",
          ml: "20",
          width: "100vh",
          h: "100vh",
          bgImage: "url('womanWritingOnCalendar.jpg')",
          justifyContent: "flex-end",
        }}>
        <Box
          bgGradient={{
            lg: "to-r",
            base: "to-t",
          }}
          gradientFrom={"ourBg"}
          gradientTo={"ourBgTrans"}
          h={{ lg: "100vh", base: "80vh" }}
          width={"100%"}
        />
        <Box h={{ lg: "0vh", base: "20vh" }} bgColor={"ourBg"}
          width={"100%"}></Box>
      </Box>
    </Box>
  );
}
